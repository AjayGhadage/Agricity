const router = require("express").Router();
const multer = require("multer");
const fs = require("fs");
const axios = require("axios");

const speech = require("@google-cloud/speech");
const textToSpeech = require("@google-cloud/text-to-speech");

const upload = multer({ dest: "uploads/" });

const speechClient = new speech.SpeechClient();
const ttsClient = new textToSpeech.TextToSpeechClient();

// 🎤 POST /api/voice
router.post("/", upload.single("audio"), async (req, res) => {
  try {
    const filePath = req.file.path;

    // ============================
    // 🧠 1. SPEECH → TEXT
    // ============================

    const audioBytes = fs.readFileSync(filePath).toString("base64");

    const request = {
      audio: { content: audioBytes },
      config: {
        encoding: "LINEAR16",
        languageCode: "en-IN", // later dynamic
      },
    };

    const [response] = await speechClient.recognize(request);
    const transcript =
      response.results.map(r => r.alternatives[0].transcript).join(" ");

    // ============================
    // 🤖 2. CALL YOUR CHAT API
    // ============================

    const chatRes = await axios.post("http://localhost:5001/chat", {
      message: transcript
    });

    const replyText = chatRes.data.reply;

    // ============================
    // 🔊 3. TEXT → SPEECH
    // ============================

    const ttsRequest = {
      input: { text: replyText },
      voice: { languageCode: "en-IN", ssmlGender: "NEUTRAL" },
      audioConfig: { audioEncoding: "MP3" },
    };

    const [ttsResponse] = await ttsClient.synthesizeSpeech(ttsRequest);

    const outputFile = "output.mp3";
    fs.writeFileSync(outputFile, ttsResponse.audioContent, "binary");

    // ============================
    // 📦 4. SEND RESPONSE
    // ============================

    res.json({
      transcript,
      reply: replyText,
      audio: "/output.mp3"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Voice processing failed" });
  }
});

console.log("VOICE ROUTE EXPORT TYPE:", typeof router);
module.exports = router;