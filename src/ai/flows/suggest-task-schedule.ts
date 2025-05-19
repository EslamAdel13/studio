// src/ai/flows/suggest-task-schedule.ts
'use server';
/**
 * @fileOverview An AI agent that suggests optimal times for scheduling tasks based on past data.
 *
 * - suggestOptimalTaskSchedule - A function that suggests optimal times for scheduling tasks.
 * - SuggestOptimalTaskScheduleInput - The input type for the suggestOptimalTaskSchedule function.
 * - SuggestOptimalTaskScheduleOutput - The return type for the suggestOptimalTaskSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOptimalTaskScheduleInputSchema = z.object({
  taskType: z.string().describe('The type of task to schedule (e.g., "study", "workout", "work deliverable").'),
  pastTaskData: z.string().describe('Past task data, including task type, duration, and time of day.'),
});
export type SuggestOptimalTaskScheduleInput = z.infer<typeof SuggestOptimalTaskScheduleInputSchema>;

const SuggestOptimalTaskScheduleOutputSchema = z.object({
  suggestedSchedule: z.string().describe('Suggested optimal times for scheduling the task.'),
  explanation: z.string().describe('Explanation of why the suggested schedule is optimal.'),
});
export type SuggestOptimalTaskScheduleOutput = z.infer<typeof SuggestOptimalTaskScheduleOutputSchema>;

export async function suggestOptimalTaskSchedule(input: SuggestOptimalTaskScheduleInput): Promise<SuggestOptimalTaskScheduleOutput> {
  return suggestOptimalTaskScheduleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOptimalTaskSchedulePrompt',
  input: {schema: SuggestOptimalTaskScheduleInputSchema},
  output: {schema: SuggestOptimalTaskScheduleOutputSchema},
  prompt: `You are an AI assistant that analyzes a user's past task data and suggests optimal times for scheduling similar tasks in the future.

  Analyze the following past task data:
  {{pastTaskData}}

  For the task type: {{taskType}},
  suggest an optimal schedule with an explanation:
  `,
});

const suggestOptimalTaskScheduleFlow = ai.defineFlow(
  {
    name: 'suggestOptimalTaskScheduleFlow',
    inputSchema: SuggestOptimalTaskScheduleInputSchema,
    outputSchema: SuggestOptimalTaskScheduleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
