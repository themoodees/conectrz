"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
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

function validateContent(
  content: string,
  t: Awaited<ReturnType<typeof getTranslations<"app.serverErrors">>>,
): string | null {
  if (!content) return t("writeFirst");
  if (content.length > MAX_MESSAGE_LENGTH) {
    return t("tooLong", { max: MAX_MESSAGE_LENGTH.toLocaleString() });
  }
  return null;
}

/** Replies in an existing conversation (companies and creators). */
export async function sendMessage(
  _previous: SendMessageState,
  formData: FormData,
): Promise<SendMessageState> {
  const t = await getTranslations("app.serverErrors");
  const conversationId = String(formData.get("conversationId") ?? "");
  const content = String(formData.get("content") ?? "").trim();
  const hasFiles = formData.getAll("attachment").length > 0;
  const invalid = hasFiles && !content ? null : validateContent(content, t);
  if (invalid) return { error: invalid };

  if (isMockMode) {
    if (hasFiles) return { error: t("demoAttachments") };
    const conversation = mockStore.conversations.find((c) => c.id === conversationId);
    if (!conversation) return { error: t("conversationNotFound") };
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
    if (!attachments) return { error: t("attachmentsFailed") };
    const { data: message, error } = await supabase
      .from("messages")
      .insert({ conversation_id: conversationId, sender_id: user.id, content })
      .select("id")
      .single();
    if (error || !message) return { error: t("messageFailed") };
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
          error: t("attachmentsFailedAfter"),
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
  const t = await getTranslations("app.serverErrors");
  if (isMockMode) {
    const conversation = mockStore.conversations.find((c) => c.id === conversationId);
    if (!conversation) return { error: t("conversationNotFound") };
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
        error: error.code === "23505" ? t("alreadyOpen") : t("updateFailed"),
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
  const t = await getTranslations("app.serverErrors");
  const creatorId = String(formData.get("creatorId") ?? "");
  const content = String(formData.get("content") ?? "").trim();
  const invalid = validateContent(content, t);
  if (invalid) return { error: invalid };

  let conversationId: string;

  if (isMockMode) {
    const usage = await getConversationUsage();
    if (usage && usage.quota !== null && usage.used >= usage.quota) {
      return {
        error: usage.isFree
          ? "Your Free plan can't start new conversations. Upgrade to contact creators."
          : t("planLimit"),
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
        return { error: t("dailyLimit") };
      }
      if (message.includes("conversation_quota_reached")) {
        return { error: t("planLimit") };
      }
      if (error?.code === "23505") {
        return { error: t("alreadyOpen") };
      }
      if (message.includes("creator_not_available")) {
        return { error: t("creatorUnavailable") };
      }
      return { error: t("messageFailed") };
    }
    conversationId = data;
  }

  await trackEvent({ name: "conversation_started" });
  revalidateInboxes();
  revalidatePath(`/creators/${creatorId}`);
  redirect(`/messages/${conversationId}`);
}
