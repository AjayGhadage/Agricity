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
   model: "llama3-8b-8192",
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
app.use("/api/compare", require("./routes/comparisonRoutes"));
app.use("/api/advisory", require("./routes/wheatheroute"));
app.use("/api/disease", require("./routes/diseaseRoutes"));
app.use("/api/voice", require("./routes/voiceRoutes"));
app.use("/api/crop", require("./routes/cropRoutes"));
// ============================
// 🤖 CHAT API
// ============================
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    // 🌍 1. Detect language
    const language = await detectLanguage(message);

    // 🔄 2. Translate to English
    const englishMsg =
      language !== "English"
        ? await toEnglish(message)
        : message;

    // 🧠 3. Extract data
    const { crop, location, intents } =
      await extractQuery(englishMsg);

    if (!crop || !location) {
      return res.json({
        reply: "Please specify crop and location clearly."
      });
    }

    let priceData = null;
    let advisoryData = null;

    // 🔗 4. Call APIs
    if (intents.includes("price")) {
      try {
        const priceRes = await axios.get(
          `http://localhost:5001/api/prices?crop=${crop}&location=${location}`
        );
        priceData = priceRes.data;
      } catch (err) {
        console.log("Price API failed");
      }
    }

    if (intents.includes("advisory")) {
      try {
        const advRes = await axios.get(
          `http://localhost:5001/api/advisory?crop=${crop}&location=${location}`
        );
        advisoryData = advRes.data;
      } catch (err) {
        console.log("Advisory API failed");
      }
    }

    let cropData = null;
    if (intents.includes("crop")) {
      try {
        const cropRes = await axios.post(
          "http://localhost:5001/api/crop",
          req.body
        );
        cropData = cropRes.data;
      } catch (err) {
        console.log("Crop API failed");
      }
    }

    // 🧠 5. Generate AI response
    const prompt = `
User query: "${englishMsg}"

Data:
Price: ${priceData ? JSON.stringify(priceData) : "N/A"}
Advisory: ${advisoryData ? JSON.stringify(advisoryData) : "N/A"}
Crop Recommendation: ${cropData ? JSON.stringify(cropData) : "N/A"}

Give clear, simple, farmer-friendly advice.
`;

    let reply = await generateText(prompt);

    // 🔄 6. Translate back
    if (language !== "English") {
      reply = await fromEnglish(reply, language);
    }

    res.json({ reply, language });

  } catch (err) {
    console.error("CHAT ERROR:", err.message);

    res.status(500).json({
      reply: "Something went wrong"
    });
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