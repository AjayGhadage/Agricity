const router = require("express").Router();
const axios = require("axios");
const multer = require("multer");
const FormData = require("form-data");

const upload = multer();

// 🔥 POST /api/disease
router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const formData = new FormData();
    formData.append("file", req.file.buffer, "image.jpg");

    // 🔗 Call FastAPI
    const response = await axios.post(
      "http://127.0.0.1:8001/predict-disease",
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    res.json(response.data);

  } catch (err) {
    console.error("Disease API Error:", err.message);

    res.status(500).json({
      message: "Disease prediction failed",
      error: err.message,
    });
  }
});

module.exports = router;