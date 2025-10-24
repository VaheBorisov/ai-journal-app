import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

import { createCategory, fetchCategories } from '@/lib/sanity/categories';

import { getCategorizePrompt } from '@/lib/helpers/prompts';

export async function POST(req: Request) {
  try {
    const { title, content, userId } = await req.json();

    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    if (!content) {
      return new Response('Content is required', { status: 400 });
    }

    console.log('Categorizing entry:', {
      title,
      contentLength: content.length,
    });

    const existingCategories = await fetchCategories();
    console.log(
      `Found ${existingCategories.length} existing categories:`,
      existingCategories.map(c => c.title),
    );

    // Prepare the entry text for AI analysis
    const entryText = title ? `Title: ${title}\n\nContent: ${content}` : content;

    const result = await generateObject({
      model: openai('gpt-4o'),
      schema: z.object({
        categoryAction: z
          .enum(['existing', 'new'])
          .describe(
            "Whether to use an existing category or create a new one. IMPORTANT: Prefer 'existing' if any category is a reasonable match.",
          ),
        categoryId: z
          .string()
          .describe(
            "REQUIRED if categoryAction is 'existing': The _id of the existing category to use. Leave empty string if creating new.",
          ),
        newCategoryTitle: z
          .string()
          .describe(
            "REQUIRED if categoryAction is 'new': The title for the new category (e.g., 'Work & Career'). Leave empty string if using existing.",
          ),
        newCategoryColor: z
          .string()
          .describe(
            "REQUIRED if categoryAction is 'new': Hex color for the new category (e.g., '#3B82F6'). Leave empty string if using existing.",
          ),
        reasoning: z
          .string()
          .describe('Brief explanation of why this category was chosen or created.'),
      }),
      prompt: getCategorizePrompt(entryText, existingCategories),
    });

    console.log('AI categorization result:', result.object);

    let categoryId: string;
    let categoryTitle: string;

    if (result.object.categoryAction === 'existing') {
      if (!result.object.categoryId || result.object.categoryId.trim() === '') {
        return new Response('Category ID is required when using existing category', {
          status: 400,
        });
      }
      categoryId = result.object.categoryId;
      categoryTitle = existingCategories.find(c => c._id === categoryId)?.title || 'Unknown';
      console.log('Using existing category:', categoryId, categoryTitle);
    } else {
      // Create a new category
      if (
        !result.object.newCategoryTitle ||
        result.object.newCategoryTitle.trim() === '' ||
        !result.object.newCategoryColor ||
        result.object.newCategoryColor.trim() === ''
      ) {
        return new Response(
          'New category title and color are required when creating a new category',
          { status: 400 },
        );
      }

      console.log('Creating new category:', result.object.newCategoryTitle);

      const newCategory = await createCategory({
        title: result.object.newCategoryTitle,
        color: result.object.newCategoryColor,
      });

      categoryId = newCategory._id;
      categoryTitle = result.object.newCategoryTitle;
      console.log('Created new category with ID:', categoryId);
    }

    return Response.json({
      categoryId,
      reasoning: result.object.reasoning,
      action: result.object.categoryAction,
      categoryTitle,
    });
  } catch (error) {
    console.error('Error in categorization:', error);
    return new Response(
      `Failed to categorize entry: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { status: 500 },
    );
  }
}
