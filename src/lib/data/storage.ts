import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

/*
 * Storage buckets are private, so the database keeps storage PATHS
 * (e.g. "<user-id>/photo.jpg") and we turn them into short-lived signed URLs
 * when reading. Values that are already full URLs (mock data) pass through.
 */

export type MediaBucket = "creator-photos" | "portfolio" | "project-references";

const SIGNED_URL_SECONDS = 60 * 60;
const isFullUrl = (value: string) => /^https?:\/\//.test(value);

/** Signs many values at once; keeps order. Null/failed values come back null. */
export async function signMedia(
  supabase: SupabaseClient<Database>,
  bucket: MediaBucket,
  values: (string | null)[],
): Promise<(string | null)[]> {
  const paths = [...new Set(values.filter((v): v is string => Boolean(v) && !isFullUrl(v!)))];
  const signed = new Map<string, string>();
  if (paths.length > 0) {
    const { data } = await supabase.storage.from(bucket).createSignedUrls(paths, SIGNED_URL_SECONDS);
    for (const item of data ?? []) {
      if (item.path && item.signedUrl) signed.set(item.path, item.signedUrl);
    }
  }
  return values.map((v) => (!v ? null : isFullUrl(v) ? v : (signed.get(v) ?? null)));
}
