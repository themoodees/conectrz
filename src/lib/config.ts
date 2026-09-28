/*
 * App-wide settings read from environment variables (.env.local).
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** "mock" unless explicitly set to "supabase" (and Supabase is configured). */
export const DATA_SOURCE: "mock" | "supabase" =
  process.env.NEXT_PUBLIC_DATA_SOURCE === "supabase" && supabaseUrl && supabaseKey
    ? "supabase"
    : "mock";

export const isMockMode = DATA_SOURCE === "mock";

export const supabaseConfig = {
  url: supabaseUrl ?? "",
  publishableKey: supabaseKey ?? "",
};
