import { defineQuery } from 'groq';
import type {
  JOURNAL_ENTRY_BY_ID_QUERYResult,
  USER_JOURNAL_ENTRIES_QUERYResult,
  USER_JOURNAL_ENTRIES_WITH_DATE_RANGE_QUERYResult,
} from '@/sanity/sanity.types';

import { sanityClient } from '@/lib/sanity/client';
import { uploadImageToSanity } from '@/lib/sanity/images';
import { categorizeJournalEntry } from '@/lib/utils/categorize';

interface JournalEntryInput {
  title?: string;
  content: string;
  images: { uri: string; caption?: string; alt?: string }[];
  mood: string;
  userId: string;
}

export const USER_JOURNAL_ENTRIES_QUERY = defineQuery(`*[
  _type == "journalEntry" 
  && userId == $userId
] | order(createdAt desc) {
  _id,
  title,
  content,
  mood,
  createdAt,
  aiGeneratedCategory->{
    title,
    color
  }
}`);

export const JOURNAL_ENTRY_BY_ID_QUERY = defineQuery(`*[
  _type == "journalEntry" 
  && _id == $entryId
][0]{
  _id,
  title,
  content,
  mood,
  createdAt,
  userId,
  aiGeneratedCategory->{
    title,
    color
  }
}`);

export const USER_JOURNAL_ENTRIES_WITH_DATE_RANGE_QUERY = defineQuery(`*[
  _type == "journalEntry" 
  && userId == $userId
  && createdAt >= $startDate
  && createdAt <= $endDate
] | order(createdAt desc) {
  _id,
  title,
  content,
  mood,
  createdAt,
  aiGeneratedCategory->{
    title,
    color
  }
}`);

export const createJournalEntry = async (entry: JournalEntryInput) => {
  try {
    console.log('Creating journal entry with auto-categorization...');

    let categoryId: string | undefined;
    try {
      const categorization = await categorizeJournalEntry(entry.title, entry.content, entry.userId);
      categoryId = categorization.categoryId;
      console.log(
        `Entry categorized as: ${categorization.categoryTitle} (${categorization.action})`,
      );
      console.log(`Reasoning: ${categorization.reasoning}`);
    } catch (categorizationError) {
      console.error('Categorization failed, continuing without category:', categorizationError);
    }

    const uploadedImages = await Promise.all(
      entry.images.map(async img => {
        const asset = await uploadImageToSanity(img.uri);
        return {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: asset._id,
          },
          alt: img.alt || 'Journal entry image',
          caption: img.caption || '',
        };
      }),
    );

    const contentBlocks = [
      {
        _type: 'block',
        _key: 'content-block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: 'content-span',
            text: entry.content,
            marks: [],
          },
        ],
        markDefs: [],
      },
      ...uploadedImages.map((img, index) => ({
        ...img,
        _key: `image-${index}`,
      })),
    ];

    const journalEntry = {
      _type: 'journalEntry' as const,
      title: entry.title,
      content: contentBlocks,
      mood: entry.mood,
      userId: entry.userId,
      createdAt: new Date().toISOString(),
      ...(categoryId && {
        aiGeneratedCategory: {
          _type: 'reference' as const,
          _ref: categoryId,
        },
      }),
    };

    const result = await sanityClient.create(journalEntry);
    console.log('Journal entry created successfully with ID:', result._id);
    return result;
  } catch (error) {
    console.error('Error creating journal entry:', error);
    throw error;
  }
};

export const fetchJournalEntries = async (
  userId: string,
): Promise<USER_JOURNAL_ENTRIES_QUERYResult> => {
  try {
    return await sanityClient.fetch(USER_JOURNAL_ENTRIES_QUERY, {
      userId,
    });
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    throw error;
  }
};

export const updateJournalEntry = async (entryId: string, updates: Partial<JournalEntryInput>) => {
  try {
    console.log('Updating journal entry with auto-categorization...');

    let categoryId: string | undefined;
    if (updates.content || updates.title) {
      try {
        const currentEntry = await sanityClient.fetch(JOURNAL_ENTRY_BY_ID_QUERY, { entryId });

        if (currentEntry && currentEntry.userId) {
          const categorization = await categorizeJournalEntry(
            updates.title !== undefined ? updates.title : (currentEntry.title ?? undefined),
            updates.content || '', // If content is being updated, use new content
            currentEntry.userId,
          );
          categoryId = categorization.categoryId;
          console.log(
            `Entry re-categorized as: ${categorization.categoryTitle} (${categorization.action})`,
          );
          console.log(`Reasoning: ${categorization.reasoning}`);
        }
      } catch (categorizationError) {
        console.error(
          'Re-categorization failed, continuing without updating category:',
          categorizationError,
        );
      }
    }

    const updateData = {
      ...updates,
      ...(updates.content && {
        content: [
          {
            _type: 'block' as const,
            _key: 'updated-content-block',
            style: 'normal' as const,
            children: [
              {
                _type: 'span' as const,
                _key: 'updated-content-span',
                text: updates.content,
                marks: [],
              },
            ],
            markDefs: [],
          },
        ],
      }),
      ...(categoryId && {
        aiGeneratedCategory: {
          _type: 'reference' as const,
          _ref: categoryId,
        },
      }),
    };

    const result = await sanityClient.patch(entryId).set(updateData).commit();
    console.log('Journal entry updated successfully');
    return result;
  } catch (error) {
    console.error('Error updating journal entry:', error);
    throw error;
  }
};

export const deleteJournalEntry = async (entryId: string) => {
  try {
    return await sanityClient.delete(entryId);
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    throw error;
  }
};

export const getJournalEntryById = async (
  entryId: string,
): Promise<JOURNAL_ENTRY_BY_ID_QUERYResult> => {
  try {
    return await sanityClient.fetch(JOURNAL_ENTRY_BY_ID_QUERY, {
      entryId,
    });
  } catch (error) {
    console.error('Error fetching journal entry:', error);
    throw error;
  }
};

export const fetchJournalEntriesWithDateRange = async (
  userId: string,
  startDate: string,
  endDate: string,
): Promise<USER_JOURNAL_ENTRIES_WITH_DATE_RANGE_QUERYResult> => {
  try {
    return await sanityClient.fetch(USER_JOURNAL_ENTRIES_WITH_DATE_RANGE_QUERY, {
      userId,
      startDate,
      endDate,
    });
  } catch (error) {
    console.error('Error fetching journal entries with date range:', error);
    throw error;
  }
};
