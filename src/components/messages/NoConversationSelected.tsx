import { MessageIcon } from "@/components/ui/icons";

/** Right pane when no conversation is open (desktop only — phones show the list). */
export function NoConversationSelected() {
  return (
    <div className="hidden flex-1 flex-col items-center justify-center px-6 text-center md:flex">
      <span className="grid size-12 place-items-center rounded-full bg-surface text-muted">
        <MessageIcon className="size-5" />
      </span>
      <p className="mt-4 font-medium text-ink">Select a conversation</p>
      <p className="mt-1 text-sm text-muted">Your conversations appear on the left.</p>
    </div>
  );
}
