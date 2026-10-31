import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-flash', 'gemini-3.8-flash'];
  for (const m of models) {
    try {
      const res = await ai.models.generateContent({ model: m, contents: 'Say OK' });
      console.log(`✅ Model ${m} SUCCESS:`, res.text?.trim());
      break;
    } catch (err) {
      console.log(`❌ Model ${m} ERROR:`, err.status || err.message);
    }
  }
}
main();

