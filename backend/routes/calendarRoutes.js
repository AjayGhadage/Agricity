const router = require("express").Router();
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// POST /api/calendar
router.post("/", async (req, res) => {
  try {
    const { crop, region } = req.body;
    
    if (!crop || !region) {
      return res.status(400).json({ error: "Crop and Region are required" });
    }

    const prompt = `
Generate a 12-month crop calendar for growing ${crop} in ${region}.
Return ONLY a valid JSON object with a single key "calendar" containing an array of 12 items representing January to December.
Each item in the array must have exactly this structure:
{
  "month": "Jan", // Short month name
  "phase": "Preparation" | "Sowing" | "Growing" | "Harvesting" | "Storage" | "Idle",
  "activity": "Short specific activity for this month (e.g. 'Deep ploughing')",
  "color": "bg-yellow-100 text-yellow-800" // Use Tailwind color classes matching the phase (e.g. Sowing=green, Harvesting=amber/yellow, Growing=blue/emerald, Idle=gray)
}
Rules:
- MUST be exactly 12 items in the array.
- Month order MUST be exactly Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec.
- ONLY output the JSON object, absolutely no other text.
`;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are an agricultural expert system that outputs strict valid JSON objects." },
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const aiText = response.choices[0].message.content.trim();
    let calendarData = [];

    try {
      const parsed = JSON.parse(aiText);
      calendarData = parsed.calendar || Array.from(parsed);
    } catch (e) {
      console.error("Failed to parse calendar JSON", e, aiText);
      return res.status(500).json({ error: "Failed to generate valid calendar data" });
    }
    
    res.json({ calendar: calendarData });

  } catch (err) {
    console.error("Calendar API Error:", err);
    res.status(500).json({ error: "Failed to generate crop calendar" });
  }
});

module.exports = router;
