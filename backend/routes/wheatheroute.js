const router = require("express").Router();
const axios = require("axios");

// GET /api/advisory
router.get("/", async (req, res) => {
  const { location, crop } = req.query;

  try {
    const apiKey = process.env.WEATHER_API_KEY; // move to .env later

    const weatherRes = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`
    );

    const weather = weatherRes.data;

    const temp = weather.main.temp;
    const humidity = weather.main.humidity;
    const condition = weather.weather[0].main;
    const windSpeed = weather.wind?.speed || 0;
    const pressure = weather.main?.pressure || 0;
    const visibility = weather.visibility || 0;
    const sunrise = weather.sys?.sunrise || 0;
    const sunset = weather.sys?.sunset || 0;
    const tempMin = weather.main?.temp_min || temp;
    const tempMax = weather.main?.temp_max || temp;

    let advisory = "";

    if (condition.includes("Rain")) {
      advisory = "Avoid spraying pesticides. Ensure proper drainage.";
    } else if (temp > 35) {
      advisory = "High temperature. Increase irrigation.";
    } else if (humidity > 70) {
      advisory = "High humidity. Risk of fungal disease.";
    } else {
      advisory = "Weather is normal. Continue regular farming.";
    }

    res.json({
      location,
      crop,
      weather: {
        temp,
        humidity,
        condition,
        windSpeed,
        pressure,
        visibility,
        sunrise,
        sunset,
        tempMin,
        tempMax
      },
      advisory
    });

  } catch (err) {
    res.status(500).json({ error: "Failed to fetch weather" });
  }
});

module.exports = router;