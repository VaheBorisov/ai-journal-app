import { urlFor } from '@/lib/sanity/client';

import type { JournalEntry } from '@/sanity/sanity.types';

export interface JournalImage {
  uri: string;
  caption?: string;
  alt?: string;
}

type PortableTextContent = NonNullable<JournalEntry['content']>;

export const extractTextContent = (content: PortableTextContent | null): string => {
  if (!content) return '';

  return content
    .filter(block => block._type === 'block')
    .map(block => {
      if (block._type !== 'block') return '';
      return block.children
        ?.filter(child => child._type === 'span')
        .map(child => child.text || '')
        .join('');
    })
    .join('\n\n');
};

export const extractImages = (content: PortableTextContent | null): JournalImage[] => {
  if (!content) return [];

  const images: JournalImage[] = [];

  for (const block of content) {
    if (block._type === 'image') {
      const imageUrl = block.asset ? urlFor(block).width(800).auto('format').url() : null;

      if (imageUrl) {
        images.push({
          uri: imageUrl,
          caption: block.caption,
          alt: block.alt || 'Journal entry image',
        });
      }
    }
  }

  return images;
};
