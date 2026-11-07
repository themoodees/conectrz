import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { ConversationSummary } from "@/types/messages";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { ConversationRow } from "./ConversationList";

/** Right pane (full screen on phones) listing archived conversations. */
export async function ArchivedConversations({
  conversations,
  basePath,
}: {
  conversations: ConversationSummary[];
  basePath: string;
}) {
  const t = await getTranslations("app.inbox");
  return (
    <section className="flex min-w-0 flex-1 flex-col" aria-labelledby="archived-heading">
      <header className="flex items-center gap-2 border-b border-border px-4 py-4 md:px-6">
        <Link
          href={basePath}
          aria-label={t("back")}
          className="-ml-2 grid size-9 place-items-center rounded-full text-graphite hover:bg-surface md:hidden"
        >
          <ArrowLeftIcon className="size-5" />
        </Link>
        <h2 id="archived-heading" className="text-lg font-semibold text-ink">
          {t("archivedTitle")}
        </h2>
      </header>
      {conversations.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted md:px-6">{t("noArchived")}</p>
      ) : (
        <ul className="flex-1 overflow-y-auto py-2">
          {conversations.map((conversation) => (
            <li key={conversation.id}>
              <ConversationRow
                conversation={conversation}
                href={`${basePath}/${conversation.id}`}
              />
            </li>
          ))}
        </ul>
      )}
      <p className="border-t border-border px-4 py-3 text-xs text-muted md:px-6">
        {t("restoreHint")}
      </p>
    </section>
  );
}
