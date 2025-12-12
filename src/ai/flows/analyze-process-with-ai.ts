'use server';
/**
 * @fileOverview An AI flow for analyzing a business process for automation potential.
 *
 * - analyzeProcess - A function that takes form data and scores, returning an AI-driven analysis.
 */

import { ai } from '@/ai/genkit';
import scoringRules from '@/app/lib/scoring-rules.json';
import { AnalyzeProcessInputSchema, AnalyzeProcessOutputSchema, type AnalyzeProcessInput, type AnalyzeProcessOutput } from './types';


export async function analyzeProcess(input: AnalyzeProcessInput): Promise<AnalyzeProcessOutput> {
  return analyzeProcessFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeProcessPrompt',
  input: { schema: AnalyzeProcessInputSchema },
  output: { schema: AnalyzeProcessOutputSchema },
  prompt: `${scoringRules.aiAnalysisPrompt}

Here is the data for the process:

**1. Form Responses:**
\`\`\`json
{{{json formSnapshot}}}
\`\`\`

**2. Calculated Scores:**
\`\`\`json
{{{json scores}}}
\`\`\`
`,
});

const analyzeProcessFlow = ai.defineFlow(
  {
    name: 'analyzeProcessFlow',
    inputSchema: AnalyzeProcessInputSchema,
    outputSchema: AnalyzeProcessOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI model did not return a valid analysis.');
    }
    return output;
  }
);
