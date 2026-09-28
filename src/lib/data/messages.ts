import "server-only";
import type {
  ConversationCreator,
  ConversationSummary,
  ConversationThread,
  Message,
} from "@/types/messages";
import { isMockMode } from "@/lib/config";
import { mockCreators } from "@/mocks/creators";
import { mockStore } from "@/mocks/store";
import type { MockConversation } from "@/mocks/conversations";
import { getSupabaseSession } from "./session";

/*
 * Conversations for the signed-in company.
 * Starting new conversations is not available yet (see Creator Profile).
 */

/* ── Mock helpers ─────────────────────────────────────────────────────────── */

function mockCreatorFor(creatorId: string): ConversationCreator {
  const creator = mockCreators.find((c) => c.id === creatorId);
  return {
    id: creatorId,
    displayName: creator?.displayName ?? "Creator",
    photoUrl: creator?.photoUrl ?? null,
  };
}

function mockToMessages(conversation: MockConversation): Message[] {
  return conversation.messages.map((m) => ({
    id: m.id,
    content: m.content,
    createdAt: m.createdAt,
    isMine: m.fromCompany,
    readAt: m.readAt,
  }));
}

/* ── Queries ──────────────────────────────────────────────────────────────── */

const toCreator = (row: {
  id: string;
  display_name: string;
  photo_url: string | null;
}): ConversationCreator => ({
  id: row.id,
  displayName: row.display_name,
  photoUrl: row.photo_url,
});

const newestFirst = (a: ConversationSummary, b: ConversationSummary) =>
  (b.lastMessage?.createdAt ?? "").localeCompare(a.lastMessage?.createdAt ?? "");

export async function getConversations(): Promise<ConversationSummary[]> {
  if (isMockMode) {
    return mockStore.conversations
      .map((conversation) => {
        const messages = mockToMessages(conversation);
        const lastMessage = messages.at(-1) ?? null;
        return {
          id: conversation.id,
          creator: mockCreatorFor(conversation.creatorId),
          lastMessage,
          hasUnread: Boolean(lastMessage && !lastMessage.isMine && !lastMessage.readAt),
        };
      })
      .sort(newestFirst);
  }

  const { supabase, user } = await getSupabaseSession();
  if (!user) return [];

  const { data, error } = await supabase
    .from("conversations")
    .select(
      "id, creator_profiles ( id, display_name, photo_url ), messages ( id, content, sender_id, created_at, read_at )",
    )
    .eq("company_id", user.id)
    .eq("archived_by_company", false)
    // Only the latest message per conversation, for the preview.
    .order("created_at", { referencedTable: "messages", ascending: false })
    .limit(1, { referencedTable: "messages" });
  if (error) throw error;

  return data
    .flatMap((row): ConversationSummary[] => {
      if (!row.creator_profiles) return [];
      const latest = row.messages[0];
      const lastMessage: Message | null = latest
        ? {
            id: latest.id,
            content: latest.content,
            createdAt: latest.created_at,
            isMine: latest.sender_id === user.id,
            readAt: latest.read_at,
          }
        : null;
      return [
        {
          id: row.id,
          creator: toCreator(row.creator_profiles),
          lastMessage,
          hasUnread: Boolean(lastMessage && !lastMessage.isMine && !lastMessage.readAt),
        },
      ];
    })
    .sort(newestFirst);
}

export async function getConversation(id: string): Promise<ConversationThread | null> {
  if (isMockMode) {
    const conversation = mockStore.conversations.find((c) => c.id === id);
    if (!conversation) return null;
    return {
      id,
      creator: mockCreatorFor(conversation.creatorId),
      messages: mockToMessages(conversation),
    };
  }

  const { supabase, user } = await getSupabaseSession();
  if (!user) return null;

  const { data, error } = await supabase
    .from("conversations")
    .select(
      "id, creator_profiles ( id, display_name, photo_url ), messages ( id, content, sender_id, created_at, read_at )",
    )
    .eq("id", id)
    .eq("company_id", user.id)
    .order("created_at", { referencedTable: "messages", ascending: true })
    .maybeSingle();
  if (error) throw error;
  if (!data?.creator_profiles) return null;

  return {
    id: data.id,
    creator: toCreator(data.creator_profiles),
    messages: data.messages.map((m) => ({
      id: m.id,
      content: m.content,
      createdAt: m.created_at,
      isMine: m.sender_id === user.id,
      readAt: m.read_at,
    })),
  };
}

/** The company's open conversation with a creator, if one exists. */
export async function getConversationIdWithCreator(creatorId: string): Promise<string | null> {
  if (isMockMode) {
    return mockStore.conversations.find((c) => c.creatorId === creatorId)?.id ?? null;
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
