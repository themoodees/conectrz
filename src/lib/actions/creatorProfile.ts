"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { LanguageProficiency, RateType, SocialPlatform } from "@/types/creator";
import type { CreatorEditorData } from "@/types/creatorEditor";
import { isMockMode, supabaseConfig } from "@/lib/config";
import { PLATFORM_OPTIONS } from "@/lib/discovery/filterConfig";
import { requireSupabaseUser } from "@/lib/data/session";
import { PREFECTURES } from "@/lib/prefectures";
import { MOCK_CREATOR_ID } from "@/mocks/account";
import { mockCreators } from "@/mocks/creators";
import { mockPortfolio } from "@/mocks/portfolio";

/*
 * Actions for the signed-in creator's own profile.
 * Every write uses the session user id — never an id sent from the browser.
 */

export interface SaveResult {
  error?: string;
  success?: string;
}

const PROFICIENCIES: LanguageProficiency[] = ["native", "fluent", "conversational"];
const RATE_TYPES: RateType[] = ["flat", "starting_from"];
const MAX_RATE_JPY = 100_000_000;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const allUuids = (ids: string[]) => ids.every((id) => UUID_PATTERN.test(id));

const mockCreator = () => mockCreators.find((c) => c.id === MOCK_CREATOR_ID)!;

function revalidateCreator(creatorId: string) {
  revalidatePath("/creator", "layout");
  revalidatePath(`/creators/${creatorId}`);
  revalidatePath("/discover");
}

/* ── Onboarding + basic details ───────────────────────────────────────────── */

function readBasics(formData: FormData) {
  return {
    displayName: String(formData.get("displayName") ?? "")
      .trim()
      .slice(0, 80),
    bio: String(formData.get("bio") ?? "")
      .trim()
      .slice(0, 1500),
    prefecture: String(formData.get("prefecture") ?? ""),
    city: String(formData.get("city") ?? "")
      .trim()
      .slice(0, 80),
    isAvailable: formData.get("isAvailable") === "on",
  };
}

function validateBasics(basics: ReturnType<typeof readBasics>): string | null {
  if (!basics.displayName) return "Enter your name.";
  if (!PREFECTURES.includes(basics.prefecture)) return "Choose your prefecture.";
  return null;
}

/** Creates the creator's profile after sign-up. */
export async function createCreatorProfile(
  _previous: SaveResult,
  formData: FormData,
): Promise<SaveResult> {
  const basics = readBasics(formData);
  const invalid = validateBasics(basics);
  if (invalid) return { error: invalid };
  if (isMockMode) redirect("/creator/profile");

  const { supabase, user } = await requireSupabaseUser();
  const { error } = await supabase.from("creator_profiles").insert({
    id: user.id,
    display_name: basics.displayName,
    bio: basics.bio || null,
    country: "Japan",
    prefecture: basics.prefecture,
    city: basics.city || null,
    is_available: true,
  });
  if (error) return { error: "Couldn't create your profile. Please try again." };

  revalidateCreator(user.id);
  redirect("/creator/profile?welcome=1");
}

export async function updateCreatorBasics(
  _previous: SaveResult,
  formData: FormData,
): Promise<SaveResult> {
  const basics = readBasics(formData);
  const invalid = validateBasics(basics);
  if (invalid) return { error: invalid };

  if (isMockMode) {
    const creator = mockCreator();
    Object.assign(creator, {
      displayName: basics.displayName,
      bio: basics.bio || null,
      prefecture: basics.prefecture,
      city: basics.city || null,
      isAvailable: basics.isAvailable,
    });
    revalidateCreator(creator.id);
    return { success: "Saved." };
  }

  const { supabase, user } = await requireSupabaseUser();
  const { error } = await supabase
    .from("creator_profiles")
    .update({
      display_name: basics.displayName,
      bio: basics.bio || null,
      prefecture: basics.prefecture,
      city: basics.city || null,
      is_available: basics.isAvailable,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (error) return { error: "Couldn't save your changes. Please try again." };

  revalidateCreator(user.id);
  return { success: "Saved." };
}

/* ── Uploaded media ───────────────────────────────────────────────────────── */

/** Only accept files uploaded to this project's bucket, inside the creator's own folder. */
function isOwnStorageUrl(url: string, bucket: string, userId: string) {
  return url.startsWith(`${supabaseConfig.url}/storage/v1/object/public/${bucket}/${userId}/`);
}

const storagePath = (url: string, bucket: string) =>
  url.split(`/storage/v1/object/public/${bucket}/`)[1];

export async function setProfilePhoto(photoUrl: string): Promise<SaveResult> {
  if (isMockMode) return { error: "Uploads are available in Supabase mode." };

  const { supabase, user } = await requireSupabaseUser();
  if (!isOwnStorageUrl(photoUrl, "creator-photos", user.id)) return { error: "Invalid photo." };

  const { data: current } = await supabase
    .from("creator_profiles")
    .select("photo_url")
    .eq("id", user.id)
    .single();

  const { error } = await supabase
    .from("creator_profiles")
    .update({ photo_url: photoUrl, updated_at: new Date().toISOString() })
    .eq("id", user.id);
  if (error) return { error: "Couldn't save your photo. Please try again." };

  // Clean up the previous photo file.
  if (current?.photo_url && isOwnStorageUrl(current.photo_url, "creator-photos", user.id)) {
    await supabase.storage
      .from("creator-photos")
      .remove([storagePath(current.photo_url, "creator-photos")]);
  }

  revalidateCreator(user.id);
  return { success: "Photo updated." };
}

export async function addPortfolioItem(item: {
  mediaUrl: string;
  mediaType: string;
  title: string;
  description: string;
}): Promise<SaveResult> {
  if (isMockMode) return { error: "Uploads are available in Supabase mode." };

  const { supabase, user } = await requireSupabaseUser();
  if (!isOwnStorageUrl(item.mediaUrl, "portfolio", user.id)) return { error: "Invalid file." };

  const { error } = await supabase.from("portfolio_items").insert({
    creator_id: user.id,
    media_url: item.mediaUrl,
    media_type: item.mediaType.startsWith("video") ? "video" : "image",
    title: item.title.trim().slice(0, 120) || null,
    description: item.description.trim().slice(0, 500) || null,
  });
  if (error) {
    await supabase.storage.from("portfolio").remove([storagePath(item.mediaUrl, "portfolio")]);
    return {
      error: error.message.includes("limit")
        ? "You can have up to 20 portfolio items. Remove one to add another."
        : "Couldn't add this item. Please try again.",
    };
  }

  revalidateCreator(user.id);
  return { success: "Added to your portfolio." };
}

export async function deletePortfolioItem(itemId: string): Promise<SaveResult> {
  if (isMockMode) {
    const items = mockPortfolio[MOCK_CREATOR_ID] ?? [];
    mockPortfolio[MOCK_CREATOR_ID] = items.filter((item) => item.id !== itemId);
    revalidateCreator(MOCK_CREATOR_ID);
    return {};
  }

  const { supabase, user } = await requireSupabaseUser();
  const { data: item } = await supabase
    .from("portfolio_items")
    .select("media_url")
    .eq("id", itemId)
    .eq("creator_id", user.id)
    .maybeSingle();
  if (!item) return { error: "Item not found." };

  const { error } = await supabase
    .from("portfolio_items")
    .delete()
    .eq("id", itemId)
    .eq("creator_id", user.id);
  if (error) return { error: "Couldn't remove this item. Please try again." };

  if (isOwnStorageUrl(item.media_url, "portfolio", user.id)) {
    await supabase.storage.from("portfolio").remove([storagePath(item.media_url, "portfolio")]);
  }

  revalidateCreator(user.id);
  return {};
}

/* ── Niches, languages, services, social accounts ─────────────────────────── */

export async function saveNiches(nicheIds: string[]): Promise<SaveResult> {
  const selected = [...new Set(nicheIds)].slice(0, 10);

  if (isMockMode) {
    mockCreator().niches = selected;
    revalidateCreator(MOCK_CREATOR_ID);
    return { success: "Saved." };
  }

  if (!allUuids(selected)) return { error: "Invalid niche." };

  const { supabase, user } = await requireSupabaseUser();
  const { data: current, error: readError } = await supabase
    .from("creator_niches")
    .select("niche_id")
    .eq("creator_id", user.id);
  if (readError) return { error: "Couldn't save. Please try again." };

  const currentIds = current.map((row) => row.niche_id);
  const toRemove = currentIds.filter((id) => !selected.includes(id));
  const toAdd = selected.filter((id) => !currentIds.includes(id));

  if (toRemove.length) {
    const { error } = await supabase
      .from("creator_niches")
      .delete()
      .eq("creator_id", user.id)
      .in("niche_id", toRemove);
    if (error) return { error: "Couldn't save. Please try again." };
  }
  if (toAdd.length) {
    const { error } = await supabase
      .from("creator_niches")
      .insert(toAdd.map((niche_id) => ({ creator_id: user.id, niche_id })));
    if (error) return { error: "Couldn't save. Please try again." };
  }

  revalidateCreator(user.id);
  return { success: "Saved." };
}

export async function saveLanguages(rows: CreatorEditorData["languages"]): Promise<SaveResult> {
  const languages = rows.filter((row) => row.languageId);
  if (new Set(languages.map((l) => l.languageId)).size !== languages.length) {
    return { error: "Each language can only be added once." };
  }
  if (languages.some((l) => !PROFICIENCIES.includes(l.proficiency))) {
    return { error: "Choose a level for each language." };
  }

  if (isMockMode) {
    mockCreator().languages = languages.map((l) => ({
      name: l.languageId,
      proficiency: l.proficiency,
    }));
    revalidateCreator(MOCK_CREATOR_ID);
    return { success: "Saved." };
  }

  if (!allUuids(languages.map((l) => l.languageId))) return { error: "Invalid language." };

  const { supabase, user } = await requireSupabaseUser();
  const { data: current, error: readError } = await supabase
    .from("creator_languages")
    .select("language_id, proficiency")
    .eq("creator_id", user.id);
  if (readError) return { error: "Couldn't save. Please try again." };

  // No UPDATE policy on creator_languages: changed rows are removed and re-added.
  const unchanged = (l: { languageId: string; proficiency: string }) =>
    current.some((c) => c.language_id === l.languageId && c.proficiency === l.proficiency);
  const toRemove = current
    .filter(
      (c) =>
        !languages.some((l) => l.languageId === c.language_id && l.proficiency === c.proficiency),
    )
    .map((c) => c.language_id);
  const toAdd = languages.filter((l) => !unchanged(l));

  if (toRemove.length) {
    const { error } = await supabase
      .from("creator_languages")
      .delete()
      .eq("creator_id", user.id)
      .in("language_id", toRemove);
    if (error) return { error: "Couldn't save. Please try again." };
  }
  if (toAdd.length) {
    const { error } = await supabase
      .from("creator_languages")
      .insert(
        toAdd.map((l) => ({
          creator_id: user.id,
          language_id: l.languageId,
          proficiency: l.proficiency,
        })),
      );
    if (error) return { error: "Couldn't save. Please try again." };
  }

  revalidateCreator(user.id);
  return { success: "Saved." };
}

export async function saveServices(rows: CreatorEditorData["services"]): Promise<SaveResult> {
  const services = rows.filter((row) => row.serviceId);
  if (new Set(services.map((s) => s.serviceId)).size !== services.length) {
    return { error: "Each service can only be added once." };
  }
  for (const service of services) {
    if (!RATE_TYPES.includes(service.rateType)) return { error: "Choose a rate type." };
    if (
      !Number.isInteger(service.rateAmountJpy) ||
      service.rateAmountJpy <= 0 ||
      service.rateAmountJpy > MAX_RATE_JPY
    ) {
      return { error: "Enter a rate in yen for each service." };
    }
  }

  if (isMockMode) {
    mockCreator().services = services.map((s) => ({
      name: s.serviceId,
      rateType: s.rateType,
      rateAmountJpy: s.rateAmountJpy,
    }));
    revalidateCreator(MOCK_CREATOR_ID);
    return { success: "Saved." };
  }

  if (!allUuids(services.map((s) => s.serviceId))) return { error: "Invalid service." };

  const { supabase, user } = await requireSupabaseUser();
  if (services.length) {
    const { error } = await supabase.from("creator_services").upsert(
      services.map((s) => ({
        creator_id: user.id,
        service_id: s.serviceId,
        rate_type: s.rateType,
        rate_amount_jpy: s.rateAmountJpy,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: "creator_id,service_id" },
    );
    if (error) return { error: "Couldn't save. Please try again." };
  }

  let removeQuery = supabase.from("creator_services").delete().eq("creator_id", user.id);
  if (services.length) {
    removeQuery = removeQuery.not(
      "service_id",
      "in",
      `(${services.map((s) => s.serviceId).join(",")})`,
    );
  }
  const { error } = await removeQuery;
  if (error) return { error: "Couldn't save. Please try again." };

  revalidateCreator(user.id);
  return { success: "Saved." };
}

export async function saveSocialAccounts(
  rows: CreatorEditorData["socialAccounts"],
): Promise<SaveResult> {
  const accounts = rows
    .map((row) => ({
      ...row,
      handle: row.handle.trim().replace(/^@/, "").slice(0, 100),
      profileUrl: row.profileUrl.trim(),
    }))
    .filter((row) => row.handle);

  for (const account of accounts) {
    if (!(PLATFORM_OPTIONS as string[]).includes(account.platform))
      return { error: "Choose a platform." };
    if (account.profileUrl && !/^https:\/\/\S+$/.test(account.profileUrl)) {
      return { error: "Profile links must start with https://" };
    }
    if (
      account.followerCount !== null &&
      (!Number.isInteger(account.followerCount) || account.followerCount < 0)
    ) {
      return { error: "Followers must be a whole number (or leave it empty)." };
    }
  }

  if (isMockMode) {
    mockCreator().socialAccounts = accounts.map((a) => ({
      platform: a.platform as SocialPlatform,
      handle: a.handle,
      profileUrl: a.profileUrl || null,
      followerCount: a.followerCount,
    }));
    revalidateCreator(MOCK_CREATOR_ID);
    return { success: "Saved." };
  }

  const keptIds = accounts.flatMap((a) => (a.id ? [a.id] : []));
  if (!allUuids(keptIds)) return { error: "Invalid account." };

  const { supabase, user } = await requireSupabaseUser();

  let removeQuery = supabase.from("social_accounts").delete().eq("creator_id", user.id);
  if (keptIds.length) removeQuery = removeQuery.not("id", "in", `(${keptIds.join(",")})`);
  const { error: removeError } = await removeQuery;
  if (removeError) return { error: "Couldn't save. Please try again." };

  for (const account of accounts) {
    const values = {
      platform: account.platform,
      handle: account.handle,
      profile_url: account.profileUrl || null,
      follower_count: account.followerCount,
    };
    const { error } = account.id
      ? await supabase
          .from("social_accounts")
          .update(values)
          .eq("id", account.id)
          .eq("creator_id", user.id)
      : await supabase.from("social_accounts").insert({ ...values, creator_id: user.id });
    if (error) return { error: "Couldn't save. Please try again." };
  }

  revalidateCreator(user.id);
  return { success: "Saved." };
}
