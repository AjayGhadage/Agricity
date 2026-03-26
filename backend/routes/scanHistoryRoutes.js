const router = require("express").Router();
const ScanHistory = require("../models/ScanHistory");

// POST /api/scan-history - Save a new scan result
router.post("/", async (req, res) => {
  try {
    const { userId, disease, confidence, advice } = req.body;
    
    // Default to 'guest' if user is not logged in
    const userToSave = userId || 'guest';

    const newScan = new ScanHistory({
      userId: userToSave,
      disease,
      confidence,
      advice
    });

    const savedScan = await newScan.save();
    res.status(201).json(savedScan);
  } catch (err) {
    console.error("Save scan history error:", err);
    res.status(500).json({ error: "Failed to save scan history" });
  }
});

// GET /api/scan-history/:userId - Get scan history for a user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    // Sort by newest first
    const history = await ScanHistory.find({ userId }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    console.error("Get scan history error:", err);
    res.status(500).json({ error: "Failed to fetch scan history" });
  }
});

module.exports = router;
