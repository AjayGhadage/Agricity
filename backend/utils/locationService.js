const axios = require("axios");

const API_KEY = "05329cc4ab5043c4b44642056ccaa86c";

async function getMappedLocation(location) {
  try {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${location}&key=${API_KEY}`;

    const response = await axios.get(url);

    const data = response.data;

    if (data.results.length > 0) {
      const components = data.results[0].components;

      // 🔥 Priority: district → state → fallback
      return (
        components.state_district ||
        components.county ||
        components.state ||
        location
      );
    }

    return location;

  } catch (err) {
    console.log("Geocoding error:", err.message);
    return location;
  }
}

module.exports = getMappedLocation;