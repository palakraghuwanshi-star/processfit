'use server';

/**
 * @fileOverview Analyzes process assessment questionnaire responses using AI to provide recommendations.
 *
 * - analyzeProcess - Analyzes the process and returns AI-driven recommendations.
 * - AnalyzeProcessInput - The input type for the analyzeProcess function.
 * - AnalyzeProcessOutput - The return type for the analyzeProcess function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeProcessInputSchema = z.object({
  processName: z.string().describe('The name of the process being analyzed.'),
  industry: z.string().describe('The industry of the organization.'),
  responses: z
    .object({
      monthlyVolume: z.number().describe('Monthly transaction volume.'),
      frequency: z.string().describe('Process frequency (Annually, Monthly, etc.).'),
      teamSize: z.number().describe('Number of people working on the process.'),
      timePercentage: z.number().describe('Percentage of time spent on the process.'),
      processingTime: z.string().describe('Average processing time per transaction.'),
      monthlyCost: z.number().describe('Estimated monthly cost to process transactions.'),
      errorRate: z.number().describe('Percentage of transactions requiring rework.'),
      compliance: z.array(z.string()).describe('Compliance requirements (None, Internal, etc.).'),
      delayImpact: z.string().describe('Impact of delays on the process.'),
      standardization: z.number().describe('Percentage of transactions following the same steps.'),
      sopStatus: z.string().describe('Documentation status of the process (None, Partial, etc.).'),
      exceptionRate: z.number().describe('Percentage of transactions requiring special handling.'),
      systems: z
        .array(
          z.object({
            name: z.string().describe('Name of the system.'),
            hasAPI: z.boolean().describe('Whether the system has an API.'),
          })
        )
        .describe('Systems involved in the process.'),
      systemAccess: z.string().describe('How the systems are accessed (Cloud, VPN, etc.).'),
      bottleneck: z.string().describe('Whether the process creates bottlenecks.'),
      complaints: z.string().describe('Frequency of complaints about the process.'),
      growthLimit: z.string().describe('Whether the process limits growth.'),
      roiTimeline: z.string().describe('Expected return on investment timeline.'),
      biggestPainPoint: z.string().describe('The single biggest problem or frustration with this process.'),
      currentChallenges: z.array(z.string()).describe('Main challenges with this process.'),
    })
    .describe('Questionnaire responses.'),
  scores: z
    .object({
      volumeScale: z.number().describe('Volume and scale score.'),
      costEfficiency: z.number().describe('Cost and efficiency score.'),
      riskCompliance: z.number().describe('Risk and compliance score.'),
      feasibility: z.number().describe('Feasibility score.'),
      strategicImpact: z.number().describe('Strategic impact score.'),
      businessImpact: z.number().describe('Business impact score.'),
      totalScore: z.number().describe('Total score.'),
      category: z.string().describe('Category of the process (Quick Win, etc.).'),
    })
    .describe('Calculated scores.'),
  flags: z.array(z.string()).describe('Red flags identified in the process.'),
});
export type AnalyzeProcessInput = z.infer<typeof AnalyzeProcessInputSchema>;

const AnalyzeProcessOutputSchema = z.object({
  recommendation: z.string().describe('AI recommendation for process automation.'),
  confidence: z.number().describe('Confidence level in the recommendation (0-100).'),
  strengths: z.array(z.string()).describe('Top strengths of the process.'),
  concerns: z.array(z.string()).describe('Top concerns related to the process.'),
  timelineEstimate: z.string().describe('Estimated timeline for automation.'),
  nextSteps: z.string().describe('Suggested next steps for process automation.'),
});
export type AnalyzeProcessOutput = z.infer<typeof AnalyzeProcessOutputSchema>;

export async function analyzeProcess(input: AnalyzeProcessInput): Promise<AnalyzeProcessOutput> {
  return analyzeProcessFlow(input);
}

const prompt = ai.definePrompt({
  name: 'processAnalysisPrompt',
  input: {schema: AnalyzeProcessInputSchema},
  output: {schema: AnalyzeProcessOutputSchema},
  prompt: `You are an AI-powered process automation consultant. Analyze the provided process data and provide actionable recommendations.

  Process Name: {{{processName}}}
  Industry: {{{industry}}}

  Responses: {{{JSON.stringify responses}}}
  Scores: {{{JSON.stringify scores}}}
  Flags: {{{JSON.stringify flags}}}

  Based on this information, provide the following:

  - Recommendation: A concise recommendation (Quick Win/Strategic/Phase 2/Not Feasible).
  - Confidence: A confidence level (0-100) for the recommendation.
  - Strengths: Identify the top 3 strengths of the process.
  - Concerns: Highlight the top 3 concerns related to the process.
  - Timeline Estimate: Estimate the timeline for automation (e.g., 3-6 months).
  - Next Steps: Suggest specific next steps to take for process automation.
  `,
});

const analyzeProcessFlow = ai.defineFlow(
  {
    name: 'analyzeProcessFlow',
    inputSchema: AnalyzeProcessInputSchema,
    outputSchema: AnalyzeProcessOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
