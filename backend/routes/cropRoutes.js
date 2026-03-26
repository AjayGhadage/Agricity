const router = require("express").Router();
const axios = require("axios");
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST /api/crop
router.post("/", async (req, res) => {
  try {
    const response = await axios.post(
      "http://127.0.0.1:8001/predict-crop",
      req.body
    );

    res.json({
      crop: response.data.recommended_crop,
      season: response.data.season_used
    });

  } catch (err) {
    console.error("Crop API error:", err.message);
    res.status(500).json({ message: "Crop prediction failed" });
  }
});

// GET /api/crop/regional?location=Satara
router.get("/regional", async (req, res) => {
  const { location } = req.query;
  if (!location) return res.status(400).json({ error: "Location required" });

  try {
    const prompt = `You are a Senior Indian Agricultural Economist. For "${location}" in India, recommend exactly 6 crops that farmers ACTUALLY grow in this specific district/region.

RANK THEM BY PROFITABILITY (most profitable first).

Return ONLY this JSON:
{
  "location": "${location}",
  "crops": [
    {
      "rank": 1,
      "name": "crop name",
      "season": "Kharif" or "Rabi" or "Zaid",
      "revenue_per_acre": "₹45,000",
      "investment_per_acre": "₹15,000",
      "profit_per_acre": "₹30,000",
      "roi_percent": 200,
      "price_per_quintal": "₹2,500",
      "yield_per_acre": "18 quintals",
      "risk_level": "Low" or "Medium" or "High",
      "soil_type": "Black" or "Red" or "Alluvial" etc,
      "water_need": "Low" or "Medium" or "High",
      "tip": "One practical profit-maximizing tip"
    }
  ]
}

CRITICAL: These must be crops ACTUALLY grown in ${location}. Use real market prices for Maharashtra/India. Do NOT include crops like Coffee or Tea unless ${location} is in a hill/plantation region. Rank #1 = highest profit.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      max_tokens: 2500,
      response_format: { type: "json_object" }
    });

    const data = JSON.parse(completion.choices[0].message.content);
    res.json(data);

  } catch (err) {
    console.error("Regional crop error:", err.message);
    res.status(500).json({ error: "Failed to fetch regional crops" });
  }
});

module.exports = router;