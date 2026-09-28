"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import type { ConversationSummary } from "@/types/messages";
import { formatConversationTime } from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";

/**
 * Left pane of Messages. On phones it's the whole screen and hides
 * while a conversation is open.
 */
export function ConversationList({ conversations }: { conversations: ConversationSummary[] }) {
  const activeId = useSelectedLayoutSegment();

  return (
    <aside
      className={`w-full flex-col border-border md:flex md:w-80 md:border-r lg:w-96 ${
        activeId ? "hidden" : "flex"
      }`}
    >
      <h1 className="px-4 pt-6 pb-4 text-2xl font-semibold text-ink md:px-5">Messages</h1>

      {conversations.length === 0 ? (
        <p className="px-4 text-sm text-muted md:px-5">
          No conversations yet. Conversations with creators will appear here.
        </p>
      ) : (
        <ul className="flex-1 overflow-y-auto pb-2">
          {conversations.map((conversation) => (
            <li key={conversation.id}>
              <ConversationRow
                conversation={conversation}
                isActive={conversation.id === activeId}
              />
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

function ConversationRow({
  conversation,
  isActive,
}: {
  conversation: ConversationSummary;
  isActive: boolean;
}) {
  const { creator, lastMessage, hasUnread } = conversation;

  return (
    <Link
      href={`/messages/${conversation.id}`}
      aria-current={isActive ? "page" : undefined}
      className={`mx-2 flex items-center gap-3 rounded-control px-2 py-3 transition-colors md:mx-3 ${
        isActive ? "bg-primary-light" : "hover:bg-surface"
      }`}
    >
      <Avatar src={creator.photoUrl} name={creator.displayName} />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className={`truncate text-sm text-ink ${hasUnread ? "font-semibold" : "font-medium"}`}>
            {creator.displayName}
          </span>
          {lastMessage && (
            <span className="shrink-0 text-xs text-muted">
              {formatConversationTime(lastMessage.createdAt)}
            </span>
          )}
        </span>
        <span className="mt-0.5 flex items-center gap-2">
          <span
            className={`truncate text-sm ${hasUnread ? "font-medium text-ink" : "text-muted"}`}
          >
            {lastMessage ? `${lastMessage.isMine ? "You: " : ""}${lastMessage.content}` : "No messages yet"}
          </span>
          {hasUnread && (
            <span className="size-2 shrink-0 rounded-full bg-primary">
              <span className="sr-only">Unread</span>
            </span>
          )}
        </span>
      </span>
    </Link>
  );
}
