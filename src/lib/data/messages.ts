import "server-only";
import type {
  ConversationSummary,
  ConversationThread,
  Counterpart,
  Message,
  Viewer,
} from "@/types/messages";
import { isMockMode } from "@/lib/config";
import { MOCK_CREATOR_ID, mockCompanyAccount } from "@/mocks/account";
import { mockCreators } from "@/mocks/creators";
import { mockStore } from "@/mocks/store";
import type { MockConversation } from "@/mocks/conversations";
import { getSupabaseSession } from "./session";

/*
 * Conversations for the signed-in user. `viewer` says which side they're on:
 * companies see creators as the counterpart, creators see companies.
 */

const MESSAGE_COLUMNS = "id, content, sender_id, created_at, read_at";
const CONVERSATION_SELECT = `
  id, archived_by_company, archived_by_creator,
  creator_profiles ( id, display_name, photo_url ),
  company_profiles ( id, name ),
  messages ( ${MESSAGE_COLUMNS} )
`;

interface ConversationRow {
  id: string;
  archived_by_company: boolean;
  archived_by_creator: boolean;
  creator_profiles: { id: string; display_name: string; photo_url: string | null } | null;
  company_profiles: { id: string; name: string } | null;
  messages: {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
    read_at: string | null;
  }[];
}

const archivedColumn = (viewer: Viewer) =>
  viewer === "company" ? "archived_by_company" : "archived_by_creator";
const ownerColumn = (viewer: Viewer) => (viewer === "company" ? "company_id" : "creator_id");

function toCounterpart(row: ConversationRow, viewer: Viewer): Counterpart | null {
  if (viewer === "company") {
    const creator = row.creator_profiles;
    return creator
      ? {
          id: creator.id,
          name: creator.display_name,
          photoUrl: creator.photo_url,
          profileHref: `/creators/${creator.id}`,
        }
      : null;
  }
  const company = row.company_profiles;
  return company ? { id: company.id, name: company.name, photoUrl: null, profileHref: null } : null;
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
      profileHref: null,
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

  return data
    .flatMap((row) => {
      const counterpart = toCounterpart(row, viewer);
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
    createdAt: row.created_at,
    isMine: row.sender_id === userId,
    readAt: row.read_at,
  };
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

  const counterpart = toCounterpart(data, viewer);
  if (!counterpart) return null;

  return {
    id: data.id,
    counterpart,
    messages: data.messages.map((m) => toMessage(m, user.id)),
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
  quota: number;
  used: number;
  periodEnd: string;
  /**
   * Free plans (¥0) are a one-time allowance: the count never resets.
   * Paid plans count per billing period.
   */
  isFree: boolean;
}

export async function getConversationUsage(): Promise<ConversationUsage | null> {
  if (isMockMode) {
    const plan = mockStore.plans.find((p) => p.name === mockStore.subscription.planName);
    const isFree = plan?.monthlyPriceJpy === 0;
    const periodStart = isFree ? "" : mockStore.subscription.periodStart;
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
    .select("monthly_price_jpy")
    .eq("name", row.tier_name)
    .maybeSingle();

  return {
    planName: row.tier_name,
    quota: row.quota,
    used: row.used,
    periodEnd: row.period_end,
    isFree: tier?.monthly_price_jpy === 0,
  };
}
