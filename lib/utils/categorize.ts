import { generateAPIUrl } from '@/lib/helpers/generateAPIUrl';

interface CategorizeResponse {
  categoryId: string;
  reasoning: string;
  action: 'existing' | 'new';
  categoryTitle: string;
}

export async function categorizeJournalEntry(
  title: string | undefined,
  content: string,
  userId: string,
): Promise<CategorizeResponse> {
  try {
    const response = await fetch(generateAPIUrl('/api/categorize'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content, userId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Categorization error: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}
