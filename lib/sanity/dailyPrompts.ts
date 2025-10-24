import { defineQuery } from 'groq';
import type { ACTIVE_DAILY_PROMPTS_QUERYResult } from '@/sanity/sanity.types';

import { sanityClient } from '@/lib/sanity/client';

export const ACTIVE_DAILY_PROMPTS_QUERY = defineQuery(`*[
  _type == "dailyPrompt" 
  && isActive == true
] | order(weight desc) {
  _id,
  title,
  prompt,
  emoji,
  category->{
    title,
    color
  },
  suggestedMood,
  isActive,
  weight,
  tags,
  createdAt
}`);

export const fetchActiveDailyPrompts = async (): Promise<ACTIVE_DAILY_PROMPTS_QUERYResult> => {
  try {
    return await sanityClient.fetch(ACTIVE_DAILY_PROMPTS_QUERY);
  } catch (error) {
    console.error('Error fetching daily prompts:', error);
    throw error;
  }
};

export const getRandomDailyPrompts = async (
  count: number = 3,
): Promise<ACTIVE_DAILY_PROMPTS_QUERYResult> => {
  try {
    const allPrompts = await fetchActiveDailyPrompts();

    if (allPrompts.length === 0) {
      return [];
    }

    const selectedPrompts: ACTIVE_DAILY_PROMPTS_QUERYResult = [];
    const availablePrompts = [...allPrompts];

    for (let i = 0; i < Math.min(count, availablePrompts.length); i++) {
      const totalWeight = availablePrompts.reduce((sum, prompt) => sum + (prompt.weight ?? 1), 0);
      let random = Math.random() * totalWeight;

      let selectedIndex = 0;
      for (let j = 0; j < availablePrompts.length; j++) {
        random -= availablePrompts[j].weight ?? 1;
        if (random <= 0) {
          selectedIndex = j;
          break;
        }
      }

      selectedPrompts.push(availablePrompts[selectedIndex]);
      availablePrompts.splice(selectedIndex, 1);
    }

    return selectedPrompts;
  } catch (error) {
    console.error('Error getting random daily prompts:', error);
    throw error;
  }
};
