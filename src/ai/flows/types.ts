import { z } from 'genkit';

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
