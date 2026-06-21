import { SupabaseClient } from '@supabase/supabase-js';

const SIGNED_URL_TTL = 60 * 60; // 1 hour

export async function signPhoto(client: SupabaseClient, path: string | null | undefined) {
  if (!path) return null;
  const { data, error } = await client.storage.from('photos').createSignedUrl(path, SIGNED_URL_TTL);
  if (error || !data) return null;
  return data.signedUrl;
}

export async function signMany(client: SupabaseClient, paths: (string | null | undefined)[]) {
  const filtered = paths.filter((p): p is string => Boolean(p));
  if (filtered.length === 0) return new Map<string, string>();
  const { data, error } = await client.storage.from('photos').createSignedUrls(filtered, SIGNED_URL_TTL);
  if (error || !data) return new Map<string, string>();
  const map = new Map<string, string>();
  data.forEach((item, i) => {
    if (item.signedUrl) map.set(filtered[i], item.signedUrl);
  });
  return map;
}
