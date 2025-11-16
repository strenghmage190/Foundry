import { supabase } from '../supabaseClient';

/**
 * Return a signed URL for a storage path, or the original URL if it's already a full URL.
 * Returns null if no path provided or if signed URL generation fails.
 */
export async function getSignedAvatarUrl(pathOrUrl: string | null, bucket = 'user-avatars', ttl = 3600): Promise<string | null> {
  if (!pathOrUrl) return null;
  try {
    if (pathOrUrl.startsWith('http')) return pathOrUrl;
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(pathOrUrl, ttl);
    if (error) {
      console.warn('getSignedAvatarUrl error', error);
      return null;
    }
    return data?.signedUrl || null;
  } catch (e) {
    console.warn('getSignedAvatarUrl unexpected error', e);
    return null;
  }
}

export function getDefaultDicebearUrl(seed: string): string {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed || 'anon')}&backgroundType=gradientLinear`;
}

export async function getAvatarUrlOrFallback(pathOrUrl: string | null, seedName: string, bucket = 'user-avatars') {
  const signed = await getSignedAvatarUrl(pathOrUrl, bucket);
  if (signed) return signed;
  return getDefaultDicebearUrl(seedName);
}
