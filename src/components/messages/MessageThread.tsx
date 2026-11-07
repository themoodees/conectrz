"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Message, Viewer } from "@/types/messages";
import { formatDayLabel, formatTime, getDayKey } from "@/lib/format";
import { markConversationRead } from "@/lib/actions/messages";

/** "ja" → "日本語" / "Japanese", in the reader's language. */
function languageName(code: string, locale: string) {
  try {
    return new Intl.DisplayNames([locale], { type: "language" }).of(code) ?? code;
  } catch {
    return code;
  }
}

interface MessageThreadProps {
  conversationId: string;
  viewer: Viewer;
  messages: Message[];
  hasUnread: boolean;
}

/** Scrollable list of messages, grouped by day. Your own messages sit on the right. */
export function MessageThread({ conversationId, viewer, messages, hasUnread }: MessageThreadProps) {
  const t = useTranslations("app.thread");
  const locale = useLocale();
  const [showOriginal, setShowOriginal] = useState<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastMine = messages.findLast((message) => message.isMine);

  // Keep the newest message in view.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  // Opening the conversation marks the other side's messages as read.
  useEffect(() => {
    if (hasUnread) void markConversationRead(conversationId, viewer);
  }, [conversationId, viewer, hasUnread]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
      <ol className="mx-auto flex max-w-2xl flex-col gap-2">
        {messages.map((message, index) => {
          const previous = messages[index - 1];
          const startsNewDay =
            !previous || getDayKey(previous.createdAt) !== getDayKey(message.createdAt);

          return (
            <li key={message.id} className="flex flex-col">
              {startsNewDay && (
                <p className="my-4 text-center text-xs font-medium text-muted">
                  {formatDayLabel(message.createdAt, locale)}
                </p>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line sm:max-w-[75%] ${
                  message.isMine
                    ? "self-end rounded-br-md bg-primary text-white"
                    : "self-start rounded-bl-md bg-surface text-ink"
                }`}
              >
                {message.attachments.length > 0 && (
                  <div
                    className={`grid gap-1.5 ${message.attachments.length > 1 ? "grid-cols-2" : ""} ${message.content ? "mb-2" : ""}`}
                  >
                    {message.attachments.map((file) =>
                      !file.url ? (
                        <p key={file.id} className="text-xs opacity-80">
                          {t("unavailable", { name: file.name })}
                        </p>
                      ) : file.kind === "video" ? (
                        <video
                          key={file.id}
                          src={file.url}
                          controls
                          preload="metadata"
                          className="max-h-64 w-full rounded-lg bg-black"
                        />
                      ) : (
                        <a key={file.id} href={file.url} target="_blank" rel="noopener noreferrer">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={file.url}
                            alt={file.name}
                            loading="lazy"
                            className="max-h-64 w-full rounded-lg object-cover"
                          />
                        </a>
                      ),
                    )}
                  </div>
                )}
                {message.translation && !showOriginal.has(message.id)
                  ? message.translation.content
                  : message.content}
              </div>
              <p
                className={`mt-1 text-[11px] text-muted ${message.isMine ? "self-end" : "self-start"}`}
              >
                {formatTime(message.createdAt)}
                {message.translation && (
                  <>
                    {" · "}
                    {showOriginal.has(message.id)
                      ? t("original")
                      : t("translatedFrom", {
                          language: languageName(message.translation.sourceLanguage, locale),
                        })}
                    {" · "}
                    <button
                      type="button"
                      onClick={() =>
                        setShowOriginal((current) => {
                          const next = new Set(current);
                          if (!next.delete(message.id)) next.add(message.id);
                          return next;
                        })
                      }
                      className="underline underline-offset-2 hover:text-ink"
                    >
                      {showOriginal.has(message.id) ? t("hideOriginal") : t("seeOriginal")}
                    </button>
                  </>
                )}
                {message === lastMine && message.readAt && ` · ${t("seen")}`}
              </p>
            </li>
          );
        })}
      </ol>
      <div ref={bottomRef} />
    </div>
  );
}
