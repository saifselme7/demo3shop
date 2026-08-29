import { supabase } from './supabase';

/** Accepts either a public URL or a path from one of the public media buckets. */
export function resolvePublicMedia(value: string, bucket: 'product-images' | 'store-assets'): string {
  if (!value || /^(https?:|data:|blob:)/i.test(value)) return value;
  return supabase?.storage.from(bucket).getPublicUrl(value).data.publicUrl ?? value;
}
