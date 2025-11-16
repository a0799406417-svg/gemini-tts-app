import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import textToSpeech from '@google-cloud/text-to-speech';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Setup Google Cloud Text-to-Speech client
// This automatically uses the GOOGLE_APPLICATION_CREDENTIALS environment variable
const ttsClient = new textToSpeech.TextToSpeechClient();

// Setup Gemini client
const genAI = new GoogleGenerativeAI(process.env.VITE_APP_GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-pro"});

const corsOptions = {
  origin: 'https://gemini-tts-app-self.vercel.app',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

app.post('/api/synthesize', async (req, res) => {
  const { originalText, tone, voice } = req.body;

  if (!originalText || !tone) {
    return res.status(400).json({ error: 'Original text and tone are required' });
  }

    try {
    // Step 1: Rewrite text with Gemini
    const prompt = `שכתב את הטקסט הבא בסגנון ${tone}. השב עם הטקסט המשוכתב בלבד, ללא כל הקדמה או הסבר נוסף.\n\nהטקסט המקורי:\n---\n${originalText}\n---`;
    const result = await geminiModel.generateContent(prompt);
    const rewrittenText = await result.response.text();

    if (!rewrittenText) {
      throw new Error("התגובה מ-Gemini הייתה ריקה.");
    }

    // Step 2: Synthesize speech from the rewritten text
    const request = {
      input: { text: rewrittenText },
    // Default to a Hebrew voice if not specified
    voice: voice || {
      languageCode: 'he-IL',
      name: 'he-IL-Wavenet-A',
    },
    audioConfig: { audioEncoding: 'MP3' },
  };

      const [response] = await ttsClient.synthesizeSpeech(request);
    const audioContent = response.audioContent.toString('base64');

    // Step 3: Send back the audio and the rewritten text
    res.json({ rewrittenText, audioContent });

  } catch (err) {
    console.error('ERROR:', err);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
