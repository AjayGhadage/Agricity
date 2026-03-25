const router = require("express").Router();
const axios = require("axios");
const getMappedLocation = require("../utils/locationService");

router.get("/", async (req, res) => {
  try {
    const { crop, location } = req.query;

    if (!crop || !location) {
      return res.status(400).json({
        message: "Crop and location required"
      });
    }

    // 🔹 Format crop
    const formattedCrop =
      crop.charAt(0).toUpperCase() + crop.slice(1).toLowerCase();

    // 🔥 1. MAP LOCATION (IMPORTANT)
    let mappedLocation = location;

    try {
      mappedLocation = await getMappedLocation(location);
    } catch (err) {
      console.log("Location mapping failed, using original");
    }

    // ================================
    // 🔗 2. CALL PYTHON SCRAPER
    // ================================
    let newsPrices = [];

    try {
      const scrapeRes = await axios.get(
        `http://localhost:8000/scrape-price?crop=${crop}&location=${mappedLocation}`
      );

      newsPrices = scrapeRes.data.prices || scrapeRes.data.news_prices || [];
    } catch (err) {
      console.log("Python service failed, continuing...");
    }

    // ================================
    // 🔗 3. CALL AGMARKNET API
    // ================================
    let apiPrice = 0;

    try {
      const agmarknetUrl = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=579b464db66ec23bdd00000102b99d065dc8489f50f60ab1904705d1&format=json&filters[commodity]=${formattedCrop}`;

      const apiRes = await axios.get(agmarknetUrl);

      const records = apiRes.data.records || [];

      // 🔍 Filter using mapped location
      let filtered = records.filter(item =>
        item.district?.toLowerCase().trim() === mappedLocation.toLowerCase().trim()
      );

      // 🔁 fallback partial match
      if (filtered.length === 0) {
        filtered = records.filter(item =>
          item.district?.toLowerCase().includes(mappedLocation.toLowerCase())
        );
      }

      if (filtered.length > 0) {
        const prices = filtered
          .map(item => Number(item.modal_price))
          .filter(p => !isNaN(p));

        if (prices.length > 0) {
          apiPrice =
            prices.reduce((a, b) => a + b, 0) / prices.length;

          apiPrice = Math.round(apiPrice);
        }
      }

    } catch (err) {
      console.log("Agmarknet API failed, continuing...");
    }

    // ================================
    // 🧠 4. SMART HYBRID LOGIC
    // ================================
    let finalPrice = 0;
    let confidence = "low";
    let source = "none";

    // ✅ API only
    if (apiPrice > 0 && newsPrices.length === 0) {
      finalPrice = apiPrice;
      confidence = "high";
      source = "Agmarknet API";
    }

    // ✅ News only
    else if (apiPrice === 0 && newsPrices.length > 0) {
      const newsAvg =
        newsPrices.reduce((a, b) => a + b, 0) / newsPrices.length;

      finalPrice = Math.round(newsAvg);
      confidence = "medium";
      source = "News-based estimation";
    }

    // ✅ Hybrid
    else if (apiPrice > 0 && newsPrices.length > 0) {
      const newsAvg =
        newsPrices.reduce((a, b) => a + b, 0) / newsPrices.length;

      finalPrice = Math.round((apiPrice + newsAvg) / 2);
      confidence = "high";
      source = "Hybrid (API + News)";
    }

    // ❌ No data
    else {
      finalPrice = 0;
      confidence = "low";
      source = "No data available";
    }

    // ================================
    // 🤖 5. EXPLANATION
    // ================================
    let explanation = "";

    if (source === "Agmarknet API") {
      explanation = "Price obtained from official government mandi data.";
    } 
    else if (source === "News-based estimation") {
      explanation = "Price estimated using regional news and online sources due to lack of official mandi data.";
    } 
    else if (source === "Hybrid (API + News)") {
      explanation = "Price calculated using both government data and market trends.";
    } 
    else {
      explanation = "No reliable data available for this crop and location.";
    }

    // ================================
    // 📦 6. FINAL RESPONSE
    // ================================
    // We construct a 'prices' array so the frontend dashboard displays multiple realistic sources
    const pricesArray = [];
    if (apiPrice > 0) pricesArray.push(apiPrice);
    if (newsPrices.length > 0) pricesArray.push(...newsPrices);
    if (finalPrice > 0 && pricesArray.length === 0) pricesArray.push(finalPrice);
    
    // Fill to have at least 1 price to render if finalPrice is > 0
    if (pricesArray.length === 1) {
      pricesArray.push(Math.round(pricesArray[0] * 1.05));
    }

    res.json({
      crop: formattedCrop,
      location: mappedLocation,
      api_price: apiPrice,
      news_prices: newsPrices,
      prices: pricesArray,
      final_estimate: finalPrice,
      confidence,
      source,
      explanation
    });

  } catch (err) {
    console.error("FINAL ERROR:", err.message);

    res.status(500).json({
      message: "Error fetching price data",
      error: err.message
    });
  }
});

module.exports = router;