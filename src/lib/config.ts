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

/** Where upgrade requests and support questions go. PLACEHOLDER — set your real address. */
/** Conectrz's social media pages (shown in the footer). */
export const SOCIAL_LINKS = [
  { name: "Instagram", href: "https://www.instagram.com/conectrz/" },
  { name: "Facebook", href: "https://www.facebook.com/profile.php?id=61596347872113" },
] as const;

export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "hello@conectrz.com";
