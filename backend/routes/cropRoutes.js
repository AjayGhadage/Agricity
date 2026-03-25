const router = require("express").Router();
const axios = require("axios");

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

    res.status(500).json({
      message: "Crop prediction failed",
    });
  }
});

module.exports = router;