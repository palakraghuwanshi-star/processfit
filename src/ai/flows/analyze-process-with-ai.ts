'use server';
/**
 * @fileOverview An AI flow for analyzing a business process for automation potential.
 *
 * - analyzeProcess - A function that takes form data and scores, returning an AI-driven analysis.
 */

import { getAi } from '@/ai/genkit';
import {
  AnalyzeProcessInputSchema,
  AnalyzeProcessOutputSchema,
  type AnalyzeProcessInput,
  type AnalyzeProcessOutput,
} from './types';
import fs from 'fs/promises';
import path from 'path';

// Define a type for the structure of scoring-rules.json
type ScoringRules = {
  aiAnalysisPrompt: string;
  // other properties can be added here if needed
};

async function getScoringRules(): Promise<ScoringRules> {
  const filePath = path.join(process.cwd(), 'src', 'app', 'lib', 'scoring-rules.json');
  const fileContent = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(fileContent);
}

export async function analyzeProcess(input: AnalyzeProcessInput): Promise<AnalyzeProcessOutput> {
  return analyzeProcessFlow(input);
}

const analyzeProcessFlow = getAi().defineFlow(
  {
    name: 'analyzeProcessFlow',
    inputSchema: AnalyzeProcessInputSchema,
    outputSchema: AnalyzeProcessOutputSchema,
  },
  async (input) => {
    // Dynamically load the rules on each execution
    const scoringRules = await getScoringRules();

    const prompt = getAi().definePrompt({
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

    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI model did not return a valid analysis.');
    }
    return output;
  }
);
