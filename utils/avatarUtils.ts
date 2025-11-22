import { supabase } from '../supabaseClient';

/**
 * Retorna URL pública estável para um asset no bucket (recomendado para buckets públicos).
 * Se já for uma URL http(s), retorna diretamente.
 * Caso o bucket seja privado e a URL pública não funcione, tenta gerar uma signed URL como fallback.
 */
export async function getStableAvatarUrl(pathOrUrl: string | null, bucket = 'user-avatars', ttl = 3600): Promise<string | null> {
  if (!pathOrUrl) return null;
  if (pathOrUrl.startsWith('http')) return pathOrUrl;
  try {
    // Tenta URL pública primeiro (não expira se bucket for público)
    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(pathOrUrl);
    if (publicData?.publicUrl) return publicData.publicUrl;
  } catch (e) {
    console.warn('StableAvatarUrl publicUrl attempt failed (continuando com signed):', e);
  }
  // Fallback: signed URL (expira, mas garante acesso em bucket privado)
  try {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(pathOrUrl, ttl);
    if (error) {
      console.warn('StableAvatarUrl signed fallback error', error);
      return null;
    }
    return data?.signedUrl || null;
  } catch (e) {
    console.warn('StableAvatarUrl unexpected signed fallback error', e);
    return null;
  }
}

export function getDefaultDicebearUrl(seed: string): string {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed || 'anon')}&backgroundType=gradientLinear`;
}

export async function getAvatarUrlOrFallback(pathOrUrl: string | null, seedName: string, bucket = 'user-avatars') {
  const stable = await getStableAvatarUrl(pathOrUrl, bucket);
  if (stable) return stable;
  return getDefaultDicebearUrl(seedName);
}

// Legacy export for backward compatibility. Wraps stable public URL logic.
export async function getSignedAvatarUrl(pathOrUrl: string | null, bucket = 'user-avatars', ttl = 3600): Promise<string | null> {
  return getStableAvatarUrl(pathOrUrl, bucket, ttl);
}
