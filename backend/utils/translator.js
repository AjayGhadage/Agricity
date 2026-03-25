require("dotenv").config();

const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function generateText(prompt) {
  const response = await groq.chat.completions.create({
    model: "llama3-8b-8192",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.2
  });

  return response.choices[0].message.content.trim();
}

// Detect language
async function detectLanguage(text) {
  const res = await generateText(`
Detect language of this text.
Return ONLY one word: English, Hindi, or Marathi.

Text: "${text}"
`);

  if (res.toLowerCase().includes("hindi")) return "Hindi";
  if (res.toLowerCase().includes("marathi")) return "Marathi";

  return "English";
}

// Translate to English
async function toEnglish(text) {
  return await generateText(`
Translate to English:
"${text}"
`);
}

// Translate from English
async function fromEnglish(text, lang) {
  return await generateText(`
Translate to ${lang}:
"${text}"
`);
}

module.exports = {
  detectLanguage,
  toEnglish,
  fromEnglish
};