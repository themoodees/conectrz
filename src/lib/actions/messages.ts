"use server";

import { revalidatePath } from "next/cache";
import { isMockMode } from "@/lib/config";
import { requireSupabaseUser } from "@/lib/data/session";
import { mockStore } from "@/mocks/store";

const MAX_MESSAGE_LENGTH = 5000;

export interface SendMessageState {
  error?: string;
  /** Changes on every successful send so the form can reset. */
  sentAt?: number;
}

/** Replies in an existing conversation. (Starting conversations isn't available yet.) */
export async function sendMessage(
  _previous: SendMessageState,
  formData: FormData,
): Promise<SendMessageState> {
  const conversationId = String(formData.get("conversationId") ?? "");
  const content = String(formData.get("content") ?? "").trim();

  if (!content) return { error: "Write a message first." };
  if (content.length > MAX_MESSAGE_LENGTH) {
    return { error: `Messages can be up to ${MAX_MESSAGE_LENGTH.toLocaleString()} characters.` };
  }

  if (isMockMode) {
    const conversation = mockStore.conversations.find((c) => c.id === conversationId);
    if (!conversation) return { error: "Conversation not found." };
    conversation.messages.push({
      id: `m-${Date.now()}`,
      content,
      createdAt: new Date().toISOString(),
      fromCompany: true,
      readAt: null,
    });
  } else {
    const { supabase, user } = await requireSupabaseUser();
    // RLS only allows sending into conversations the user takes part in.
    const { error } = await supabase
      .from("messages")
      .insert({ conversation_id: conversationId, sender_id: user.id, content });
    if (error) return { error: "Your message couldn't be sent. Please try again." };
  }

  revalidatePath("/messages", "layout");
  return { sentAt: Date.now() };
}

/** Marks the creator's messages in a conversation as read. */
export async function markConversationRead(conversationId: string) {
  const now = new Date().toISOString();

  if (isMockMode) {
    const conversation = mockStore.conversations.find((c) => c.id === conversationId);
    conversation?.messages.forEach((m) => {
      if (!m.fromCompany && !m.readAt) m.readAt = now;
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
  }

  revalidatePath("/messages", "layout");
}
