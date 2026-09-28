import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageComposer } from "@/components/messages/MessageComposer";
import { MessageThread } from "@/components/messages/MessageThread";
import { Avatar } from "@/components/ui/Avatar";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { getConversation } from "@/lib/data/messages";

export const metadata: Metadata = { title: "Messages" };

export default async function ConversationPage({ params }: PageProps<"/messages/[id]">) {
  const { id } = await params;
  const conversation = await getConversation(id);
  if (!conversation) notFound();

  const { creator, messages } = conversation;
  const hasUnread = messages.some((message) => !message.isMine && !message.readAt);

  return (
    <section className="flex min-w-0 flex-1 flex-col" aria-label={`Conversation with ${creator.displayName}`}>
      <header className="flex items-center gap-3 border-b border-border px-4 py-3 md:px-6">
        <Link
          href="/messages"
          aria-label="Back to conversations"
          className="-ml-2 grid size-9 place-items-center rounded-full text-graphite hover:bg-surface md:hidden"
        >
          <ArrowLeftIcon className="size-5" />
        </Link>
        <Avatar src={creator.photoUrl} name={creator.displayName} size="sm" />
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{creator.displayName}</p>
          <Link
            href={`/creators/${creator.id}`}
            className="text-xs font-medium text-muted hover:text-primary"
          >
            View profile
          </Link>
        </div>
      </header>

      <MessageThread conversationId={conversation.id} messages={messages} hasUnread={hasUnread} />
      <MessageComposer conversationId={conversation.id} />
    </section>
  );
}
