const mongoose = require("mongoose");

const ScanHistorySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    disease: { type: String, required: true },
    confidence: { type: Number, required: true },
    advice: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ScanHistory", ScanHistorySchema);
