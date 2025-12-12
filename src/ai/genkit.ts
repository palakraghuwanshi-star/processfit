
import {genkit, type Genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

let aiInstance: Genkit | null = null;

export function getAi(): Genkit {
  if (!aiInstance) {
    aiInstance = genkit({
      plugins: [
        googleAI({
          apiKey: process.env.GEMINI_API_KEY,
        }),
      ],
      model: 'googleai/gemini-2.5-flash',
    });
  }
  return aiInstance;
}

// For backwards compatibility with existing code that might import `ai` directly.
// This will be replaced by getAi() calls.
export const ai = getAi();
