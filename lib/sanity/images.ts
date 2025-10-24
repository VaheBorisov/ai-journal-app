import type { SanityImageAsset } from '@/sanity/sanity.types';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

import { sanityClient, urlFor } from '@/lib/sanity/client';

export const uploadImageToSanity = async (imageUri: string): Promise<SanityImageAsset> => {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();

    const asset = await sanityClient.assets.upload('image', blob, {
      filename: `journal-image-${Date.now()}.jpg`,
    });

    return asset as SanityImageAsset;
  } catch (error) {
    console.error('Error uploading image to Sanity:', error);
    throw error;
  }
};

export const getImageUrl = (asset: SanityImageSource | null | undefined, width = 800) => {
  if (!asset) return null;
  return urlFor(asset).width(width).auto('format').url();
};
