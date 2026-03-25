const router = require("express").Router();
const axios = require("axios");
const getMappedLocation = require("../utils/locationService");

router.get("/", async (req, res) => {
  try {
    const { crop, location, compare } = req.query;

    if (!crop || !location || !compare) {
      return res.status(400).json({
        message: "crop, location, compare required"
      });
    }

    // 🔹 format crop
    const formattedCrop =
      crop.charAt(0).toUpperCase() + crop.slice(1).toLowerCase();

    // 🔥 nearest mapped location
    const mappedLocation = await getMappedLocation(location);

    // 🔥 comparison list
    const locations = compare.split(",").map(l => l.trim());

    let results = [];

    for (let loc of locations) {
      // 🔹 call your existing API internally
      const response = await axios.get(
        `http://localhost:5000/api/prices?crop=${crop}&location=${loc}`
      );

      results.push({
        location: loc,
        price: response.data.final_estimate,
        is_nearest:
          loc.toLowerCase() === mappedLocation.toLowerCase()
      });
    }

    // 🔥 find best price
    const best = results.reduce((max, curr) =>
      curr.price > max.price ? curr : max
    );

    res.json({
      crop: formattedCrop,
      user_location: location,
      nearest_market: mappedLocation,
      comparison: results,
      best_location: best.location
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Comparison error"
    });
  }
});

module.exports = router;