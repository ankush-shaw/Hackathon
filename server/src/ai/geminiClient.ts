import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';

let aiInstance: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY.trim() === '') {
    return null;
  }

  if (!aiInstance) {
    try {
      aiInstance = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    } catch (err) {
      console.warn('⚠️ Could not initialize GoogleGenAI client:', err);
      return null;
    }
  }

  return aiInstance;
}

export const isGeminiConfigured = (): boolean => {
  return !!(env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim().length > 0);
};

