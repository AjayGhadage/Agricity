// backend/server.js
require("dotenv").config();
// console.log("GROQ KEY:", process.env.GROQ_API_KEY);
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const verifyToken = require("./middleware/authMiddleware");
const extractQuery = require("./utils/aiExtractor");
const axios = require("axios");

const {
  detectLanguage,
  toEnglish,
  fromEnglish
} = require("./utils/translator");

// ✅ GROQ
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// 🔥 Reusable Groq function
async function generateText(prompt) {
  const response = await groq.chat.completions.create({
   model: "llama-3.1-8b-instant",
    messages: [
      { role: "user", content: prompt }
    ],
    temperature: 0.3
  });

  return response.choices[0].message.content;
}

const app = express();

// ============================
// 🔧 MIDDLEWARE
// ============================
app.use(express.json());
app.use(cors());
app.use(express.static("."));
app.use("/audio", express.static("./public/audio"));

// ============================
// 🗄️ DATABASE
// ============================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// ============================
// 📦 ROUTES
// ============================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/auth", require("./routes/googleAuth"));
app.use("/api/prices", require("./routes/priceRoutes"));
app.use("/api/scan-history", require("./routes/scanHistoryRoutes"));
app.use("/api/calendar", require("./routes/calendarRoutes"));
app.use("/api/compare", require("./routes/comparisonRoutes"));
app.use("/api/advisory", require("./routes/wheatheroute"));
app.use("/api/disease", require("./routes/diseaseRoutes"));
app.use("/api/voice", require("./routes/voiceRoutes"));
app.use("/api/crop", require("./routes/cropRoutes"));
app.use("/api/farm", require("./routes/farmRoutes"));
app.use("/api/subsidies", require("./routes/subsidyRoutes"));
app.use("/api/calculator", require("./routes/calculatorRoutes"));
app.use("/api/logistics", require("./routes/logisticsRoutes"));
// ============================
// ============================
// 🤖 CHAT API (LLAMA 3 AGRONOMIST)
// ============================
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "No message provided." });

    // 🌍 1. Detect language
    const language = await detectLanguage(message);

    // 🔄 2. Translate to English
    const englishMsg = language !== "English" ? await toEnglish(message) : message;

    // 🧠 3. Extract data (Skip blocking if missing)
    let cropData = null;
    let priceData = null;
    let advisoryData = null;
    let locationContext = "Unknown";
    let cropContext = "Unknown";

    try {
      const { crop, location, intents } = await extractQuery(englishMsg);
      locationContext = location || "Unknown";
      cropContext = crop || "Unknown";

      // 🔗 4. Call APIs for Live Context (Only if intents match)
      if (crop && location) {
        if (intents.includes("price")) {
          const priceRes = await axios.get(`http://localhost:5001/api/prices?crop=${crop}&location=${location}`);
          priceData = priceRes.data;
        }
        if (intents.includes("advisory")) {
          const advRes = await axios.get(`http://localhost:5001/api/advisory?crop=${crop}&location=${location}`);
          advisoryData = advRes.data;
        }
      }
      if (intents.includes("crop")) {
        const crRes = await axios.post("http://localhost:5001/api/crop", req.body);
        cropData = crRes.data;
      }
    } catch (e) {
      console.log("Silent Info: Intent Extraction missed or API failed. Falling back to autonomous LLaMA brain.");
    }

    // 🧠 5. Generate AI response (Unconstrained Conversational Engine)
    const prompt = `
You are a world-class Indian Agronomist and the primary AI Assistant for the 'AgriTech Super App'.
A farmer is asking you this question: "${englishMsg}"

If live market data is available below, use it. If not, use your master knowledge base to solve their problem immediately.
Do NOT ask them to specify crop or location unless it is physically impossible to answer without it.
Keep your response under 5 concise, actionable sentences for mobile readability. Use plain text formatting.

[LIVE SENSOR DATA (Optional)]:
Live Price Data: ${priceData ? JSON.stringify(priceData) : "Not requested"}
Live Weather Advisory: ${advisoryData ? JSON.stringify(advisoryData) : "Not requested"}
`;

    let reply = await generateText(prompt);

    // 🔄 6. Translate back to farmer's native language
    if (language !== "English") {
      reply = await fromEnglish(reply, language);
    }

    res.json({ reply, language });

  } catch (err) {
    console.error("CHAT ERROR:", err.message);
    res.status(500).json({ reply: "I am experiencing high network traffic. Please try asking again." });
  }
});

// ============================
// 🔐 PROTECTED ROUTE
// ============================
app.get("/api/protected", verifyToken, (req, res) => {
  res.json({
    message: "Protected data accessed",
    user: req.user,
  });
});

// ============================
// 🚀 START SERVER
// ============================
app.listen(5001, () =>
  console.log("Server running on port 5001")
);