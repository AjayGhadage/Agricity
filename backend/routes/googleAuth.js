const router = require("express").Router();
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "No token provided" });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { sub, email, name } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        username: name,
        email: email,
        googleId: sub,
      });

      await user.save();
    }

    const appToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      message: "Google login successful",
      token: appToken,
      user
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Google auth failed" });
  }
});

module.exports = router;