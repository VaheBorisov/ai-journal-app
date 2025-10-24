import { openai } from '@ai-sdk/openai';
import { convertToModelMessages, stepCountIs, streamText, tool, UIMessage } from 'ai';
import { z } from 'zod';

import { fetchJournalEntries, fetchJournalEntriesWithDateRange } from '@/lib/sanity/journal';

import { getChatPrompt } from '@/lib/helpers/prompts';

export async function POST(req: Request) {
  const { messages, userId }: { messages: UIMessage[]; userId?: string } = await req.json();

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Get current date/time for context
  const now = new Date();
  const currentDateTime = now.toISOString();
  const currentDate = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const currentTime = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  const result = streamText({
    model: openai('gpt-4o'),
    stopWhen: stepCountIs(10),
    system: getChatPrompt(currentDate, currentTime, currentDateTime),
    messages: convertToModelMessages(messages),
    tools: {
      getAllUserJournalEntries: tool({
        description:
          "Fetch ALL of the user's journal entries without any date restrictions. Use this when the user asks general questions about their journaling history, patterns, or when they don't specify a time period. This returns all entries ordered by most recent first.",
        inputSchema: z.object({}),
        execute: async () => {
          try {
            console.log(`Fetching all journal entries for user ${userId}`);

            const entries = await fetchJournalEntries(userId);

            console.log(`Found ${entries.length} total journal entries`);

            // Format entries for the AI to understand
            const formattedEntries = entries.map(entry => {
              console.log(`Processing entry ${entry._id} from ${entry.createdAt}`);

              // Extract text content from blocks
              let content = 'No content';
              if (entry.content && entry.content.length > 0) {
                const firstBlock = entry.content[0];
                if (
                  firstBlock &&
                  '_type' in firstBlock &&
                  firstBlock._type === 'block' &&
                  'children' in firstBlock &&
                  firstBlock.children &&
                  firstBlock.children.length > 0
                ) {
                  content = firstBlock.children[0]?.text || 'No content';
                }
              }

              return {
                date: entry.createdAt,
                title: entry.title,
                mood: entry.mood,
                content,
                category: entry.aiGeneratedCategory?.title,
              };
            });

            console.log(`Successfully formatted ${formattedEntries.length} entries`);

            return {
              count: formattedEntries.length,
              entries: formattedEntries,
            };
          } catch (error) {
            console.error('Error fetching all journal entries:', error);
            return {
              error: 'Unable to fetch journal entries',
              count: 0,
              entries: [],
            };
          }
        },
      }),
      getUserJournalEntries: tool({
        description:
          "Fetch the user's journal entries within a specific date range. Use this when the user asks about past experiences, feelings, or events from their journal. The date range helps you find relevant entries from specific time periods.",
        inputSchema: z.object({
          startDate: z
            .string()
            .describe(
              "Start date in ISO format (YYYY-MM-DD or ISO datetime). Calculate this based on what the user asks (e.g., 'a year ago' would be 365 days before today).",
            ),
          endDate: z
            .string()
            .describe(
              "End date in ISO format (YYYY-MM-DD or ISO datetime). Usually today's date unless the user specifies otherwise.",
            ),
        }),
        execute: async ({ startDate, endDate }) => {
          try {
            console.log(
              `Fetching journal entries for user ${userId} from ${startDate} to ${endDate}`,
            );

            const entries = await fetchJournalEntriesWithDateRange(userId, startDate, endDate);

            console.log(`Found ${entries.length} journal entries`);

            // Format entries for the AI to understand
            const formattedEntries = entries.map(entry => {
              // Extract text content from blocks
              let content = 'No content';
              if (entry.content && entry.content.length > 0) {
                const firstBlock = entry.content[0];
                if (
                  firstBlock &&
                  '_type' in firstBlock &&
                  firstBlock._type === 'block' &&
                  'children' in firstBlock &&
                  firstBlock.children &&
                  firstBlock.children.length > 0
                ) {
                  content = firstBlock.children[0]?.text || 'No content';
                }
              }

              return {
                date: entry.createdAt,
                title: entry.title,
                mood: entry.mood,
                content,
                category: entry.aiGeneratedCategory?.title,
              };
            });

            return {
              count: formattedEntries.length,
              entries: formattedEntries,
            };
          } catch (error) {
            console.error('Error fetching journal entries:', error);
            return {
              error: 'Unable to fetch journal entries',
              count: 0,
              entries: [],
            };
          }
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse({
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'none',
    },
  });
}
