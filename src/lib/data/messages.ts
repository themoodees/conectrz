import "server-only";
import { getLocale } from "next-intl/server";
import type {
  ConversationSummary,
  ConversationThread,
  Counterpart,
  Message,
  Viewer,
} from "@/types/messages";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { isMockMode } from "@/lib/config";
import { MOCK_CREATOR_ID, mockCompanyAccount } from "@/mocks/account";
import { mockCreators } from "@/mocks/creators";
import { mockStore } from "@/mocks/store";
import type { MockConversation } from "@/mocks/conversations";
import { getSupabaseSession } from "./session";
import { signMedia } from "./storage";

/*
 * Conversations for the signed-in user. `viewer` says which side they're on:
 * companies see creators as the counterpart, creators see companies.
 */

const MESSAGE_COLUMNS =
  "id, content, sender_id, created_at, read_at, message_attachments ( id, path, kind, file_name )";
const CONVERSATION_SELECT = `
  id, creator_id, archived_by_company, archived_by_creator,
  company_profiles ( id, name ),
  messages ( ${MESSAGE_COLUMNS} )
`;

interface ConversationRow {
  id: string;
  creator_id: string;
  archived_by_company: boolean;
  archived_by_creator: boolean;
  company_profiles: { id: string; name: string } | null;
  messages: {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
    read_at: string | null;
    message_attachments: { id: string; path: string; kind: string; file_name: string }[];
  }[];
}

const archivedColumn = (viewer: Viewer) =>
  viewer === "company" ? "archived_by_company" : "archived_by_creator";
const ownerColumn = (viewer: Viewer) => (viewer === "company" ? "company_id" : "creator_id");

/**
 * Creators as a company sees them in conversations (first name only on Free).
 * Read through the `conversation_creators` view, which has no foreign keys,
 * so it's loaded separately and merged.
 */
async function loadCreatorCounterparts(
  supabase: SupabaseClient<Database>,
  ids: string[],
): Promise<Map<string, Counterpart>> {
  const result = new Map<string, Counterpart>();
  const unique = [...new Set(ids)];
  if (unique.length === 0) return result;
  const { data, error } = await supabase
    .from("conversation_creators")
    .select("id, first_name, last_name, photo_url")
    .in("id", unique);
  if (error) throw error;
  const photos = await signMedia(
    supabase,
    "creator-photos",
    data.map((c) => c.photo_url),
  );
  data.forEach((c, index) => {
    if (!c.id) return;
    result.set(c.id, {
      id: c.id,
      name: [c.first_name, c.last_name].filter(Boolean).join(" ") || "Creator",
      photoUrl: photos[index],
      profileHref: `/creators/${c.id}`,
    });
  });
  return result;
}

function toCounterpart(
  row: ConversationRow,
  viewer: Viewer,
  creators: Map<string, Counterpart>,
): Counterpart | null {
  if (viewer === "company") return creators.get(row.creator_id) ?? null;
  const company = row.company_profiles;
  return company
    ? {
        id: company.id,
        name: company.name,
        photoUrl: null,
        profileHref: `/creator/companies/${company.id}`,
      }
    : null;
}

const summarize = (
  id: string,
  counterpart: Counterpart,
  messages: Message[],
): ConversationSummary => {
  const lastMessage = messages.at(-1) ?? null;
  return {
    id,
    counterpart,
    lastMessage,
    hasUnread: Boolean(lastMessage && !lastMessage.isMine && !lastMessage.readAt),
  };
};

const newestFirst = (a: ConversationSummary, b: ConversationSummary) =>
  (b.lastMessage?.createdAt ?? "").localeCompare(a.lastMessage?.createdAt ?? "");

/* ── Mock mode ────────────────────────────────────────────────────────────── */

function mockCounterpart(conversation: MockConversation, viewer: Viewer): Counterpart {
  if (viewer === "creator") {
    return {
      id: mockCompanyAccount.id,
      name: mockCompanyAccount.companyName,
      photoUrl: null,
      profileHref: `/creator/companies/${mockCompanyAccount.id}`,
    };
  }
  const creator = mockCreators.find((c) => c.id === conversation.creatorId);
  return {
    id: conversation.creatorId,
    name: creator?.displayName ?? "Creator",
    photoUrl: creator?.photoUrl ?? null,
    profileHref: `/creators/${conversation.creatorId}`,
  };
}

const mockMessages = (conversation: MockConversation, viewer: Viewer): Message[] =>
  conversation.messages.map((m) => ({
    id: m.id,
    content: m.content,
    attachments: [],
    createdAt: m.createdAt,
    isMine: viewer === "company" ? m.fromCompany : !m.fromCompany,
    readAt: m.readAt,
  }));

const mockIsArchived = (conversation: MockConversation, viewer: Viewer) =>
  Boolean(viewer === "company" ? conversation.archivedByCompany : conversation.archivedByCreator);

/** Conversations the mock user can see. Mock companies see all; the mock creator sees theirs. */
const mockVisibleConversations = (viewer: Viewer) =>
  mockStore.conversations.filter(
    (conversation) => viewer === "company" || conversation.creatorId === MOCK_CREATOR_ID,
  );

/* ── Queries ──────────────────────────────────────────────────────────────── */

export async function getConversations(
  viewer: Viewer,
  { archived = false }: { archived?: boolean } = {},
): Promise<ConversationSummary[]> {
  if (isMockMode) {
    return mockVisibleConversations(viewer)
      .filter((conversation) => mockIsArchived(conversation, viewer) === archived)
      .map((conversation) =>
        summarize(
          conversation.id,
          mockCounterpart(conversation, viewer),
          mockMessages(conversation, viewer),
        ),
      )
      .sort(newestFirst);
  }

  const { supabase, user } = await getSupabaseSession();
  if (!user) return [];

  const { data, error } = await supabase
    .from("conversations")
    .select(CONVERSATION_SELECT)
    .eq(ownerColumn(viewer), user.id)
    .eq(archivedColumn(viewer), archived)
    // Only the latest message per conversation, for the preview.
    .order("created_at", { referencedTable: "messages", ascending: false })
    .limit(1, { referencedTable: "messages" })
    .overrideTypes<ConversationRow[], { merge: false }>();
  if (error) throw error;

  const creators =
    viewer === "company"
      ? await loadCreatorCounterparts(
          supabase,
          data.map((row) => row.creator_id),
        )
      : new Map<string, Counterpart>();

  return data
    .flatMap((row) => {
      const counterpart = toCounterpart(row, viewer, creators);
      if (!counterpart) return [];
      const messages = row.messages.map((m) => toMessage(m, user.id));
      return [summarize(row.id, counterpart, messages)];
    })
    .sort(newestFirst);
}

function toMessage(row: ConversationRow["messages"][number], userId: string): Message {
  return {
    id: row.id,
    content: row.content,
    attachments: (row.message_attachments ?? []).map((a) => ({
      id: a.id,
      kind: a.kind === "video" ? "video" : "image",
      name: a.file_name,
      url: null,
    })),
    createdAt: row.created_at,
    isMine: row.sender_id === userId,
    readAt: row.read_at,
  };
}

/**
 * Adds the reader's-language translation to the other person's messages. Missing translations
 * are requested from the translate-messages edge function (which stores them, so each message
 * is translated once). Any failure just leaves the original text.
 */
async function attachTranslations(
  supabase: SupabaseClient<Database>,
  conversationId: string,
  messages: Message[],
) {
  const language = await getLocale();
  const incoming = messages.filter((m) => !m.isMine && m.content.trim() !== "");
  if (incoming.length === 0) return;
  const ids = incoming.map((m) => m.id);

  const load = async () => {
    const { data } = await supabase
      .from("message_translations")
      .select("message_id, content, source_language")
      .eq("language", language)
      .in("message_id", ids);
    return new Map((data ?? []).map((t) => [t.message_id, t]));
  };

  let found = await load();
  if (found.size < ids.length) {
    const { error } = await supabase.functions.invoke("translate-messages", {
      body: { conversation_id: conversationId, language },
    });
    if (!error) found = await load();
  }

  for (const message of incoming) {
    const t = found.get(message.id);
    if (t && t.source_language !== language) {
      message.translation = { content: t.content, sourceLanguage: t.source_language };
    }
  }
}

export async function getConversation(
  viewer: Viewer,
  id: string,
): Promise<ConversationThread | null> {
  if (isMockMode) {
    const conversation = mockVisibleConversations(viewer).find((c) => c.id === id);
    if (!conversation) return null;
    return {
      id,
      counterpart: mockCounterpart(conversation, viewer),
      messages: mockMessages(conversation, viewer),
      isArchived: mockIsArchived(conversation, viewer),
    };
  }

  const { supabase, user } = await getSupabaseSession();
  if (!user) return null;

  const { data, error } = await supabase
    .from("conversations")
    .select(CONVERSATION_SELECT)
    .eq("id", id)
    .eq(ownerColumn(viewer), user.id)
    .order("created_at", { referencedTable: "messages", ascending: true })
    .maybeSingle()
    .overrideTypes<ConversationRow | null, { merge: false }>();
  if (error) throw error;
  if (!data) return null;

  const creators =
    viewer === "company"
      ? await loadCreatorCounterparts(supabase, [data.creator_id])
      : new Map<string, Counterpart>();
  const counterpart = toCounterpart(data, viewer, creators);
  if (!counterpart) return null;

  const messages = data.messages.map((m) => toMessage(m, user.id));
  await attachTranslations(supabase, id, messages);
  const paths = data.messages.flatMap((m) => (m.message_attachments ?? []).map((a) => a.path));
  const urls = await signMedia(supabase, "message-attachments", paths);
  const urlByPath = new Map(paths.map((path, i) => [path, urls[i]]));
  data.messages.forEach((m, i) => {
    (m.message_attachments ?? []).forEach((a, j) => {
      messages[i].attachments[j].url = urlByPath.get(a.path) ?? null;
    });
  });

  return {
    id: data.id,
    counterpart,
    messages,
    isArchived: data[archivedColumn(viewer)],
  };
}

/** The company's open (not archived) conversation with a creator, if one exists. */
export async function getConversationIdWithCreator(creatorId: string): Promise<string | null> {
  if (isMockMode) {
    return (
      mockStore.conversations.find((c) => c.creatorId === creatorId && !c.archivedByCompany)?.id ??
      null
    );
  }

  const { supabase, user } = await getSupabaseSession();
  if (!user) return null;

  const { data, error } = await supabase
    .from("conversations")
    .select("id")
    .eq("company_id", user.id)
    .eq("creator_id", creatorId)
    .eq("archived_by_company", false)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

/** Plan, limit and usage for the signed-in company. */
export interface ConversationUsage {
  planName: string;
  /** New conversations allowed per period; null = unlimited. Free has 0. */
  quota: number | null;
  used: number;
  periodEnd: string;
  /** Free plan ($0): cannot start conversations. */
  isFree: boolean;
}

export async function getConversationUsage(): Promise<ConversationUsage | null> {
  if (isMockMode) {
    const plan = mockStore.plans.find((p) => p.name === mockStore.subscription.planName);
    const isFree = plan?.monthlyPriceUsd === 0;
    const periodStart = mockStore.subscription.periodStart;
    const used = mockStore.conversations.filter(
      (c) => (c.messages[0]?.createdAt ?? "") >= periodStart,
    ).length;
    return {
      planName: mockStore.subscription.planName,
      quota: mockStore.subscription.quota,
      used,
      periodEnd: mockStore.subscription.periodEnd,
      isFree,
    };
  }

  const { supabase } = await getSupabaseSession();
  const { data, error } = await supabase.rpc("my_conversation_usage");
  if (error) throw error;
  const row = data[0];
  if (!row) return null;

  const { data: tier } = await supabase
    .from("subscription_tiers")
    .select("monthly_price_usd_cents")
    .eq("name", row.tier_name)
    .maybeSingle();

  return {
    planName: row.tier_name,
    quota: row.quota,
    used: row.used,
    periodEnd: row.period_end,
    isFree: tier?.monthly_price_usd_cents === 0,
  };
}
