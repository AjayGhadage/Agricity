const router = require("express").Router();
const Groq = require("groq-sdk");
require("dotenv").config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/", async (req, res) => {
  try {
    const { crop, quantity, location } = req.body;

    if (!crop || !quantity || !location) {
      return res.status(400).json({ message: "Crop, quantity, and location are required." });
    }

    const prompt = `Act as an expert Indian Agricultural Economist and Freight Logistics Engine.
    A farmer in ${location} wants to sell ${quantity} Quintals of ${crop}.
    
    Calculate the estimated current local selling price. 
    Then, identify 3 major neighboring or state-level mega APMC Mandis (e.g., Pune, Mumbai, Vashi, Azadpur, or relevant mega-markets strategically nearest to the location).
    Calculate the distance from the local area to each mega mandi in kilometers.
    Estimate truck transportation costs (assume a standard rate of ₹20-₹35 per km for a farm truck, scaled realistically).
    Provide realistic, historically higher market prices per quintal for those distant mega mandis.
    Calculate Gross Revenue, Net Profit (Gross - Transport Cost), and Additional Expected Profit Over Local.
    
    Use dynamic and mathematically precise calculations. Ensure the "additional_profit_over_local" is exactly: Net Profit - local_net_profit.
    One destination MUST be highly profitable, one moderately profitable, and one where transport costs might eat up the profits (Negative or Low additional profit) to prove the AI's logical evaluation.

    Provide the output EXACTLY as valid JSON in the following format:
    {
      "local_mandi": "Name of local mandi",
      "local_price_per_quintal": 2500,
      "local_net_profit": 125000,
      "destinations": [
        {
           "mandi": "Mega APMC Name",
           "distance_km": 150,
           "price_per_quintal": 2900,
           "transport_cost": 3000,
           "gross_revenue": 145000,
           "net_profit": 142000,
           "additional_profit_over_local": 17000,
           "recommendation": "Highly Recommended"
        }
      ]
    }`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "system", content: "You output JSON exclusively." }, { role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const aiData = JSON.parse(completion.choices[0].message.content);
    res.json(aiData);

  } catch (error) {
    console.error("Logistics Route Error:", error);
    res.status(500).json({ message: "Failed to generate logistics routing." });
  }
});

module.exports = router;
