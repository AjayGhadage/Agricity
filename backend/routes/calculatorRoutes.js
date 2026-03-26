const router = require("express").Router();
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST /api/calculator
router.post("/", async (req, res) => {
  const { crop, area, soilType } = req.body;

  if (!crop || !area) {
    return res.status(400).json({ error: "Crop and Area are required." });
  }

  try {
    const prompt = `You are an expert Indian Agricultural Economist.
Calculate a detailed fertilizer requirement and ROI estimate for growing ${crop} on ${area} acres of ${soilType || "Medium"} soil in India.

Produce EXACTLY a JSON object with a single key "calculator" containing the following exact structure:
{
  "fertilizers": [
    { "name": "Urea", "quantity": "e.g. 50 kg", "cost": "e.g. ₹266" },
    { "name": "DAP", "quantity": "e.g. 50 kg", "cost": "e.g. ₹1350" },
    { "name": "MOP", "quantity": "e.g. 25 kg", "cost": "e.g. ₹850" }
  ],
  "totalFertilizerCost": "e.g. ₹2466",
  "estimatedSeedCost": "e.g. ₹1200",
  "estimatedLaborCost": "e.g. ₹4000",
  "totalInvestment": "e.g. ₹7666",
  "estimatedRevenue": "e.g. ₹25000",
  "netProfit": "e.g. ₹17334",
  "roiPercentage": "e.g. 226%",
  "advice": "1 practical sentence on cost saving for this specific crop."
}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    const data = JSON.parse(completion.choices[0].message.content);
    const calculator = data.calculator || Object.values(data)[0];

    res.json({ calculator });

  } catch (err) {
    console.error("Calculator Generation Error:", err.message);
    res.status(500).json({ error: "Failed to generate ROI calculation." });
  }
});

module.exports = router;
