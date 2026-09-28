"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import type { ConversationSummary } from "@/types/messages";
import { formatConversationTime } from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";
import { ArchiveIcon } from "@/components/ui/icons";

interface ConversationListProps {
  conversations: ConversationSummary[];
  /** "/messages" for companies, "/creator/messages" for creators. */
  basePath: string;
  emptyText: string;
}

/**
 * Left pane of the inbox. On phones it's the whole screen and hides
 * while a conversation (or the archive) is open.
 */
export function ConversationList({ conversations, basePath, emptyText }: ConversationListProps) {
  const activeSegment = useSelectedLayoutSegment();

  return (
    <aside
      className={`w-full flex-col border-border md:flex md:w-80 md:border-r lg:w-96 ${
        activeSegment ? "hidden" : "flex"
      }`}
    >
      <h1 className="px-4 pt-6 pb-4 text-2xl font-semibold text-ink md:px-5">Messages</h1>

      {conversations.length === 0 ? (
        <p className="flex-1 px-4 text-sm text-muted md:px-5">{emptyText}</p>
      ) : (
        <ul className="flex-1 overflow-y-auto pb-2">
          {conversations.map((conversation) => (
            <li key={conversation.id}>
              <ConversationRow
                conversation={conversation}
                href={`${basePath}/${conversation.id}`}
                isActive={conversation.id === activeSegment}
              />
            </li>
          ))}
        </ul>
      )}

      <Link
        href={`${basePath}/archived`}
        className={`flex items-center gap-2 border-t border-border px-4 py-3 text-sm font-medium md:px-5 ${
          activeSegment === "archived" ? "text-primary" : "text-graphite hover:text-ink"
        }`}
      >
        <ArchiveIcon className="size-4" />
        Archived conversations
      </Link>
    </aside>
  );
}

export function ConversationRow({
  conversation,
  href,
  isActive = false,
}: {
  conversation: ConversationSummary;
  href: string;
  isActive?: boolean;
}) {
  const { counterpart, lastMessage, hasUnread } = conversation;

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`mx-2 flex items-center gap-3 rounded-control px-2 py-3 transition-colors md:mx-3 ${
        isActive ? "bg-primary-light" : "hover:bg-surface"
      }`}
    >
      <Avatar src={counterpart.photoUrl} name={counterpart.name} />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span
            className={`truncate text-sm text-ink ${hasUnread ? "font-semibold" : "font-medium"}`}
          >
            {counterpart.name}
          </span>
          {lastMessage && (
            <span className="shrink-0 text-xs text-muted">
              {formatConversationTime(lastMessage.createdAt)}
            </span>
          )}
        </span>
        <span className="mt-0.5 flex items-center gap-2">
          <span className={`truncate text-sm ${hasUnread ? "font-medium text-ink" : "text-muted"}`}>
            {lastMessage
              ? `${lastMessage.isMine ? "You: " : ""}${lastMessage.content}`
              : "No messages yet"}
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
