// backend/utils/aiExtractor.js
require("dotenv").config();
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// 🔥 Reusable Groq function
async function generateText(prompt) {
  const response = await groq.chat.completions.create({
   model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: `
You are a strict JSON generator.

Rules:
- ONLY return valid JSON
- No explanation
- No extra text
- No markdown
`
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0
  });

  return response.choices[0].message.content.trim();
}

// ============================
// 🧠 EXTRACT QUERY
// ============================
async function extractQuery(message) {
  const prompt = `
Extract structured data from the user query.

Return ONLY JSON:
{
  "crop": "onion/wheat/tomato/rice/etc",
  "location": "city or district name",
  "intents": ["price", "advisory"]
}

Rules:
- If asking price → include "price"
- If asking weather/spray/advice → include "advisory"
- If both → include both
- Keep values simple

User: "${message}"
`;

  const text = await generateText(prompt);

  // 🔥 SAFE JSON PARSE (VERY IMPORTANT)
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("No JSON found");
    }

    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error("AI PARSE ERROR:", text);

    // 🔥 fallback (prevents crash)
    return {
      crop: null,
      location: null,
      "intents": ["price", "advisory", "crop"]
    };
  }
}

module.exports = extractQuery;