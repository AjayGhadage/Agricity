// backend/models/User.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  googleId: String, // 🔥 ADD THIS
});

module.exports = mongoose.model("User", userSchema);