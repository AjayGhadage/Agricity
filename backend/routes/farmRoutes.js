const router = require("express").Router();
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST /api/farm/timeline
router.post("/timeline", async (req, res) => {
  const { crop, area, sowDate, location } = req.body;

  if (!crop || !sowDate) {
    return res.status(400).json({ error: "Crop and Sow Date are required." });
  }

  try {
    const prompt = `You are an expert Indian Agronomist. 
Generate a realistic farming timeline for growing ${crop} starting from sowing date ${sowDate} in ${location || "India"} for ${area || 1} acres.

Produce EXACTLY a JSON object with a single key "timeline" containing an array of 6 major milestone phases.
Each phase object must have:
{
  "day": "integer (days from sowing, e.g., 0, 15, 30, 45)",
  "phase": "Short Title (e.g., Sowing, Fertilization, Weed Control, Harvest)",
  "action": "1 actionable sentence for the farmer",
  "status": "pending"
}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      max_tokens: 1500,
      response_format: { type: "json_object" } // Need to prompt for an object containing the array if using json_object mode
    });

    // Handle Groq's json_object requiring an object wrapper
    const data = JSON.parse(completion.choices[0].message.content);
    const timeline = Array.isArray(data) ? data : data.timeline || data.phases || data.steps || Object.values(data)[0];

    res.json({ timeline });
  } catch (err) {
    console.error("Timeline Generation Error:", err.message);
    res.status(500).json({ error: "Failed to generate crop timeline." });
  }
});

module.exports = router;
