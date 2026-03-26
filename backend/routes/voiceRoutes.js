const router = require("express").Router();
const multer = require("multer");
const fs = require("fs");
const axios = require("axios");

const speech = require("@google-cloud/speech");
const textToSpeech = require("@google-cloud/text-to-speech");

const upload = multer({ dest: "uploads/" });

// Detect if GOOGLE_APPLICATION_CREDENTIALS is a path or an API Key
const isApiKey = process.env.GOOGLE_APPLICATION_CREDENTIALS && process.env.GOOGLE_APPLICATION_CREDENTIALS.startsWith("AIza");
const clientOptions = isApiKey 
  ? { apiKey: process.env.GOOGLE_APPLICATION_CREDENTIALS } 
  : {};

if (!isApiKey && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  // If it's a path, ensure it's set in env for the library to find naturally
  process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS;
}

const speechClient = new speech.SpeechClient(clientOptions);
const ttsClient = new textToSpeech.TextToSpeechClient(clientOptions);

// 🎤 POST /api/voice
router.post("/", upload.single("audio"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const langCode = req.body.languageCode || "en-IN";

    // ============================
    // 🧠 1. SPEECH → TEXT
    // ============================

    const audioBytes = fs.readFileSync(filePath).toString("base64");

    const request = {
      audio: { content: audioBytes },
      config: {
        encoding: "WEBM_OPUS", // Browser MediaRecorder usually outputs webm directly
        sampleRateHertz: 48000,
        languageCode: langCode,
      },
    };

    const [response] = await speechClient.recognize(request);
    
    // If Google STT can't understand the audio blob, handle gracefully.
    if (!response.results || response.results.length === 0) {
        return res.json({
            transcript: "[Unrecognized Audio]",
            reply: "I'm sorry, I couldn't understand that audio. Please try again.",
            audio: null
        });
    }

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
      voice: { languageCode: langCode, ssmlGender: "NEUTRAL" },
      audioConfig: { audioEncoding: "MP3" },
    };

    const [ttsResponse] = await ttsClient.synthesizeSpeech(ttsRequest);
    
    // Create random filename so parallel users don't overwrite each other's audio
    const randomFname = `audio_out_${Date.now()}.mp3`;
    const outputFile = `./public/audio/${randomFname}`;
    
    // Ensure directory exists
    if (!fs.existsSync('./public/audio')) {
      fs.mkdirSync('./public/audio', { recursive: true });
    }

    fs.writeFileSync(outputFile, ttsResponse.audioContent, "binary");

    // ============================
    // 📦 4. SEND RESPONSE
    // ============================

    res.json({
      transcript,
      reply: replyText,
      audio: `/audio/${randomFname}`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Voice processing failed" });
  }
});

console.log("VOICE ROUTE EXPORT TYPE:", typeof router);
module.exports = router;