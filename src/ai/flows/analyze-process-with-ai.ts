'use server';
/**
 * @fileOverview An AI flow for analyzing a business process for automation potential.
 *
 * - analyzeProcess - A function that takes form data and scores, returning an AI-driven analysis.
 * - AnalyzeProcessInput - The input type for the analyzeProcess function.
 * - AnalyzeProcessOutput - The return type for the analyzeProcess function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { FormValues } from '@/app/lib/schema';
import type { AnalysisScores } from '@/app/lib/data-store';
import scoringRules from '@/app/lib/scoring-rules.json';

export const AnalyzeProcessInputSchema = z.object({
  formSnapshot: z.any().describe('The full form data submitted by the user.'),
  scores: z.any().describe('The pre-calculated scores for the process.'),
});

export const AnalyzeProcessOutputSchema = z.object({
  recommendation: z.string().describe("The AI's final recommendation (e.g., 'QUICK WIN')."),
  confidence: z.number().describe('The confidence level of the recommendation (0-100).'),
  topStrengths: z.array(z.string()).describe('Top 3 strengths for automation.'),
  topConcerns: z.array(z.string()).describe('Top 3 concerns or risks for automation.'),
  timelineEstimate: z.string().describe('An estimated project timeline.'),
  nextSteps: z.string().describe('Suggested concrete next steps.'),
});

export type AnalyzeProcessInput = z.infer<typeof AnalyzeProcessInputSchema>;
export type AnalyzeProcessOutput = z.infer<typeof AnalyzeProcessOutputSchema>;

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
