import { defineQuery } from 'groq';
import type { ALL_CATEGORIES_QUERYResult } from '@/sanity/sanity.types';

import { sanityClient } from '@/lib/sanity/client';

type Category = ALL_CATEGORIES_QUERYResult[0];

export const ALL_CATEGORIES_QUERY = defineQuery(`*[
  _type == "category"
] | order(title asc) {
  _id,
  title,
  color
}`);

export const fetchCategories = async (): Promise<ALL_CATEGORIES_QUERYResult> => {
  try {
    const categories = await sanityClient.fetch(ALL_CATEGORIES_QUERY);
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const createCategory = async (category: {
  title: string;
  color?: string;
}): Promise<NonNullable<Category>> => {
  try {
    const newCategory = {
      _type: 'category' as const,
      title: category.title,
      color: category.color,
    };

    const result = await sanityClient.create(newCategory);
    return result as NonNullable<Category>;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};
