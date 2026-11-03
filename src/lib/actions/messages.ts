"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Viewer } from "@/types/messages";
import { trackEvent } from "@/lib/analytics";
import { isMockMode } from "@/lib/config";
import { requireSupabaseUser } from "@/lib/data/session";
import { getConversationUsage } from "@/lib/data/messages";
import { mockStore } from "@/mocks/store";

const MAX_MESSAGE_LENGTH = 5000;

export interface SendMessageState {
  error?: string;
  /** Changes on every successful send so the form can reset. */
  sentAt?: number;
}

const parseViewer = (value: FormDataEntryValue | null): Viewer =>
  value === "creator" ? "creator" : "company";

function revalidateInboxes() {
  revalidatePath("/messages", "layout");
  revalidatePath("/creator/messages", "layout");
}

const MAX_ATTACHMENTS = 5;

interface AttachmentInput {
  path: string;
  kind: "image" | "video";
  name: string;
  size: number;
}

/** Reads the `attachment` JSON fields the composer submits (one per uploaded file). */
function parseAttachments(formData: FormData, prefix: string): AttachmentInput[] | null {
  const items: AttachmentInput[] = [];
  for (const raw of formData.getAll("attachment")) {
    try {
      const value = JSON.parse(String(raw));
      const valid =
        typeof value.path === "string" &&
        value.path.startsWith(prefix) &&
        !value.path.includes("..") &&
        (value.kind === "image" || value.kind === "video") &&
        typeof value.name === "string" &&
        Number.isFinite(value.size) &&
        value.size > 0;
      if (!valid) return null;
      items.push({
        path: value.path,
        kind: value.kind,
        name: value.name.slice(0, 200),
        size: Math.round(value.size),
      });
    } catch {
      return null;
    }
  }
  return items.length > MAX_ATTACHMENTS ? null : items;
}

function validateContent(content: string): string | null {
  if (!content) return "Write a message first.";
  if (content.length > MAX_MESSAGE_LENGTH) {
    return `Messages can be up to ${MAX_MESSAGE_LENGTH.toLocaleString()} characters.`;
  }
  return null;
}

/** Replies in an existing conversation (companies and creators). */
export async function sendMessage(
  _previous: SendMessageState,
  formData: FormData,
): Promise<SendMessageState> {
  const conversationId = String(formData.get("conversationId") ?? "");
  const content = String(formData.get("content") ?? "").trim();
  const hasFiles = formData.getAll("attachment").length > 0;
  const invalid = hasFiles && !content ? null : validateContent(content);
  if (invalid) return { error: invalid };

  if (isMockMode) {
    if (hasFiles) return { error: "Attachments aren't available in the demo." };
    const conversation = mockStore.conversations.find((c) => c.id === conversationId);
    if (!conversation) return { error: "Conversation not found." };
    conversation.messages.push({
      id: `m-${Date.now()}`,
      content,
      createdAt: new Date().toISOString(),
      fromCompany: parseViewer(formData.get("viewer")) === "company",
      readAt: null,
    });
  } else {
    const { supabase, user } = await requireSupabaseUser();
    // RLS only allows sending into conversations the user takes part in.
    const attachments = parseAttachments(formData, `${conversationId}/${user.id}/`);
    if (!attachments) return { error: "Those attachments couldn't be sent. Please try again." };
    const { data: message, error } = await supabase
      .from("messages")
      .insert({ conversation_id: conversationId, sender_id: user.id, content })
      .select("id")
      .single();
    if (error || !message) return { error: "Your message couldn't be sent. Please try again." };
    if (attachments.length > 0) {
      const { error: attachError } = await supabase.from("message_attachments").insert(
        attachments.map((a) => ({
          message_id: message.id,
          path: a.path,
          kind: a.kind,
          file_name: a.name,
          size_bytes: a.size,
        })),
      );
      if (attachError) {
        // Users can't delete messages, so say plainly what did go through.
        revalidateInboxes();
        return {
          error: "Your message was sent, but the attachments couldn't be. Please send them again.",
        };
      }
    }
  }

  revalidateInboxes();
  return { sentAt: Date.now() };
}

/** Marks the other side's messages in a conversation as read. */
export async function markConversationRead(conversationId: string, viewer: Viewer) {
  const now = new Date().toISOString();

  if (isMockMode) {
    const conversation = mockStore.conversations.find((c) => c.id === conversationId);
    conversation?.messages.forEach((m) => {
      const fromOtherSide = viewer === "company" ? !m.fromCompany : m.fromCompany;
      if (fromOtherSide && !m.readAt) m.readAt = now;
    });
  } else {
    const { supabase, user } = await requireSupabaseUser();
    const { error } = await supabase
      .from("messages")
      .update({ read_at: now })
      .eq("conversation_id", conversationId)
      .neq("sender_id", user.id)
      .is("read_at", null);
    if (error) return;

    // Clear the new-message notification so the next message emails again
    // (the database sends one email per conversation until it's read).
    await supabase
      .from("notifications")
      .update({ read_at: now })
      .eq("user_id", user.id)
      .eq("type", "new_message")
      .eq("payload->>conversation_id", conversationId)
      .is("read_at", null);
  }

  revalidateInboxes();
}

/** Archives or restores a conversation for the signed-in side only. */
export async function setConversationArchived(
  conversationId: string,
  viewer: Viewer,
  archived: boolean,
): Promise<{ error?: string }> {
  if (isMockMode) {
    const conversation = mockStore.conversations.find((c) => c.id === conversationId);
    if (!conversation) return { error: "Conversation not found." };
    if (viewer === "company") conversation.archivedByCompany = archived;
    else conversation.archivedByCreator = archived;
  } else {
    const { supabase } = await requireSupabaseUser();
    // RLS limits this to participants; a DB trigger stops users changing the other side's flag.
    const { error } = await supabase
      .from("conversations")
      .update(
        viewer === "company"
          ? { archived_by_company: archived }
          : { archived_by_creator: archived },
      )
      .eq("id", conversationId);
    if (error) {
      // one_active_conversation_per_pair: a newer open conversation already exists.
      return {
        error:
          error.code === "23505"
            ? "You already have an open conversation with this creator."
            : "Couldn't update the conversation. Please try again.",
      };
    }
  }

  revalidateInboxes();
  return {};
}

export interface StartConversationState {
  error?: string;
}

/**
 * Company → creator: starts a conversation with a first message.
 * The database enforces the plan's conversation limit.
 */
export async function startConversation(
  _previous: StartConversationState,
  formData: FormData,
): Promise<StartConversationState> {
  const creatorId = String(formData.get("creatorId") ?? "");
  const content = String(formData.get("content") ?? "").trim();
  const invalid = validateContent(content);
  if (invalid) return { error: invalid };

  let conversationId: string;

  if (isMockMode) {
    const usage = await getConversationUsage();
    if (usage && usage.quota !== null && usage.used >= usage.quota) {
      return {
        error: usage.isFree
          ? "Your Free plan can't start new conversations. Upgrade to contact creators."
          : "You've reached your plan's conversation limit for this period.",
      };
    }
    conversationId = `cv-${Date.now()}`;
    mockStore.conversations.push({
      id: conversationId,
      creatorId,
      messages: [
        {
          id: `m-${Date.now()}`,
          content,
          createdAt: new Date().toISOString(),
          fromCompany: true,
          readAt: null,
        },
      ],
    });
  } else {
    const { supabase } = await requireSupabaseUser();
    const { data, error } = await supabase.rpc("start_conversation", {
      p_creator_id: creatorId,
      p_message: content,
    });
    if (error || !data) {
      const message = error?.message ?? "";
      if (message.includes("daily_limit_reached")) {
        return { error: "You've reached today's limit for new conversations. Try again tomorrow." };
      }
      if (message.includes("conversation_quota_reached")) {
        return { error: "You've reached your plan's conversation limit for this period." };
      }
      if (error?.code === "23505") {
        return { error: "You already have an open conversation with this creator." };
      }
      if (message.includes("creator_not_available")) {
        return { error: "This creator isn't available right now." };
      }
      return { error: "Your message couldn't be sent. Please try again." };
    }
    conversationId = data;
  }

  await trackEvent({ name: "conversation_started" });
  revalidateInboxes();
  revalidatePath(`/creators/${creatorId}`);
  redirect(`/messages/${conversationId}`);
}
