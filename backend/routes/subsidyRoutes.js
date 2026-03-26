const router = require("express").Router();
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST /api/subsidies
router.post("/", async (req, res) => {
  const { state, landSize, category } = req.body;

  if (!state || !landSize) {
    return res.status(400).json({ error: "State and Land Size are required." });
  }

  try {
    const prompt = `You are an expert on Indian agricultural government schemes and subsidies.
Find 5 highly relevant active government farming schemes/subsidies for a farmer in ${state}, India, who owns ${landSize} acres of land, and belongs to the ${category || "General"} category.

Produce EXACTLY a JSON object with a single key "schemes" containing an array of 5 scheme objects.
Each scheme object must have:
{
  "name": "Full name of the scheme (e.g., PM-Kisan Samman Nidhi)",
  "amount": "Financial benefit visually formatted (e.g., ₹6,000/year)",
  "eligibility": "1 short sentence explaining why they qualify based on acres/state",
  "link": "The official apply portal link (or a dummy gov.in link if unknown)",
  "tag": "Category tag (e.g., Central Gov, State Gov, Equipment, Seeds)"
}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      max_tokens: 1500,
      response_format: { type: "json_object" }
    });

    const data = JSON.parse(completion.choices[0].message.content);
    const schemes = Array.isArray(data) ? data : data.schemes || Object.values(data)[0];

    res.json({ schemes });

  } catch (err) {
    console.error("Subsidies Generation Error:", err.message);
    res.status(500).json({ error: "Failed to find government schemes." });
  }
});

module.exports = router;
