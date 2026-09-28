"use client";

import { useActionState, useRef, useState } from "react";
import { sendMessage, type SendMessageState } from "@/lib/actions/messages";
import { SendIcon } from "@/components/ui/icons";
import type { Viewer } from "@/types/messages";

/** Reply box. Enter sends, Shift+Enter adds a new line. */
export function MessageComposer({
  conversationId,
  viewer,
}: {
  conversationId: string;
  viewer: Viewer;
}) {
  const [text, setText] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, pending] = useActionState<SendMessageState, FormData>(
    async (previous, formData) => {
      const result = await sendMessage(previous, formData);
      if (!result.error) setText("");
      return result;
    },
    {},
  );

  return (
    <form ref={formRef} action={formAction} className="border-t border-border px-4 py-3 md:px-6">
      <input type="hidden" name="conversationId" value={conversationId} />
      <input type="hidden" name="viewer" value={viewer} />
      {state.error && (
        <p role="alert" className="mx-auto mb-2 max-w-2xl text-sm text-danger">
          {state.error}
        </p>
      )}
      <div className="mx-auto flex max-w-2xl items-end gap-2">
        <label htmlFor="message-content" className="sr-only">
          Message
        </label>
        <textarea
          id="message-content"
          name="content"
          rows={1}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              if (text.trim() && !pending) formRef.current?.requestSubmit();
            }
          }}
          placeholder="Write a message…"
          className="field-sizing-content max-h-40 min-h-11 flex-1 resize-none rounded-control border border-border bg-white px-3.5 py-2.5 text-base text-ink placeholder:text-muted hover:border-muted/50 focus:border-primary focus:ring-3 focus:ring-primary/15 focus:outline-none focus-visible:outline-none md:text-sm"
        />
        <button
          type="submit"
          disabled={pending || !text.trim()}
          aria-label="Send message"
          className="grid size-11 shrink-0 place-items-center rounded-control bg-primary text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-primary/40"
        >
          <SendIcon className="size-[18px]" />
        </button>
      </div>
    </form>
  );
}
