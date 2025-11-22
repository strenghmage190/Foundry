import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

// Agora tenta primeiro URL pública (evita expiração); fallback para signed se necessário.
export const useSignedUrl = (bucket: string, path: string | null | undefined, expiration: number = 3600) => {
  const [stableUrl, setStableUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!path) {
      setStableUrl(null);
      return;
    }
    const run = async () => {
      if (path.startsWith('http')) {
        if (!cancelled) setStableUrl(path);
        return;
      }
      try {
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        if (data.publicUrl) {
          if (!cancelled) setStableUrl(data.publicUrl);
          return;
        }
      } catch (e) {
        console.warn('useSignedUrl public attempt failed, trying signed', e);
      }
      try {
        const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiration);
        if (!cancelled) {
          if (error) {
            console.error('useSignedUrl signed fallback error:', error);
            setStableUrl(null);
          } else {
            setStableUrl(data.signedUrl);
          }
        }
      } catch (e) {
        if (!cancelled) {
          console.error('useSignedUrl unexpected signed error:', e);
          setStableUrl(null);
        }
      }
    };
    run();
    return () => { cancelled = true; };
  }, [bucket, path, expiration]);

  return stableUrl;
};
