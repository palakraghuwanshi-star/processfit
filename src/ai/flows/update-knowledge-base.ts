'use server';
/**
 * @fileOverview A flow for updating the knowledge base file.
 *
 * - updateKnowledgeBase - A function that handles writing to the scoring-rules.json file.
 * - KnowledgeBaseInput - The input type for the updateKnowledgeBase function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { updateFile } from '@/app/lib/update-file';

const KnowledgeBaseInputSchema = z.object({
  content: z.string().describe('The full JSON content of the scoring-rules.json file.'),
});

export type KnowledgeBaseInput = z.infer<typeof KnowledgeBaseInputSchema>;

export async function updateKnowledgeBase(input: KnowledgeBaseInput): Promise<{ success: boolean; error?: string }> {
  return updateKnowledgeBaseFlow(input);
}

const updateKnowledgeBaseFlow = ai.defineFlow(
  {
    name: 'updateKnowledgeBaseFlow',
    inputSchema: KnowledgeBaseInputSchema,
    outputSchema: z.object({ success: z.boolean(), error: z.string().optional() }),
  },
  async (input) => {
    try {
      // In a real production app, you'd add more validation and security here.
      // For this prototype, we directly write the content to the file.
      await updateFile('src/app/lib/scoring-rules.json', input.content);
      return { success: true };
    } catch (e: any) {
      console.error('Error updating knowledge base:', e);
      return { success: false, error: e.message || 'An unknown error occurred.' };
    }
  }
);
