"use client";

import { useActionState, useRef, useState } from "react";
import { sendMessage, type SendMessageState } from "@/lib/actions/messages";
import { isMockMode } from "@/lib/config";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { CloseIcon, SendIcon, UploadIcon } from "@/components/ui/icons";
import type { Viewer } from "@/types/messages";

const MAX_FILES = 5;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const VIDEO_TYPES = ["video/mp4", "video/quicktime"];
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

interface Attached {
  path: string;
  kind: "image" | "video";
  name: string;
  size: number;
  previewUrl: string;
}

/** Reply box. Enter sends, Shift+Enter adds a new line. Images and videos can be attached. */
export function MessageComposer({
  conversationId,
  viewer,
}: {
  conversationId: string;
  viewer: Viewer;
}) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<Attached[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [state, formAction, pending] = useActionState<SendMessageState, FormData>(
    async (previous, formData) => {
      const result = await sendMessage(previous, formData);
      if (!result.error) {
        setText("");
        files.forEach((f) => URL.revokeObjectURL(f.previewUrl));
        setFiles([]);
      }
      return result;
    },
    {},
  );

  const canSend = !pending && !uploading && (text.trim().length > 0 || files.length > 0);

  async function upload(chosen: FileList) {
    setUploadError(null);
    const room = MAX_FILES - files.length;
    if (chosen.length > room) setUploadError(`You can attach up to ${MAX_FILES} files per message.`);

    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return setUploadError("Please sign in again.");

    setUploading(true);
    const added: Attached[] = [];
    for (const file of [...chosen].slice(0, room)) {
      const kind = IMAGE_TYPES.includes(file.type)
        ? "image"
        : VIDEO_TYPES.includes(file.type)
          ? "video"
          : null;
      if (!kind) {
        setUploadError("Use JPG, PNG or WebP images, or MP4 or MOV videos.");
        continue;
      }
      if (file.size > (kind === "image" ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES)) {
        setUploadError(
          kind === "image" ? "Images can be up to 10 MB." : "Videos can be up to 50 MB.",
        );
        continue;
      }
      const extension = file.name.split(".").pop()?.toLowerCase() ?? (kind === "image" ? "jpg" : "mp4");
      const path = `${conversationId}/${data.user.id}/${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage
        .from("message-attachments")
        .upload(path, file, { contentType: file.type });
      if (error) {
        setUploadError("Upload failed. Please try again.");
        continue;
      }
      added.push({
        path,
        kind,
        name: file.name,
        size: file.size,
        previewUrl: URL.createObjectURL(file),
      });
    }
    setFiles((current) => [...current, ...added]);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function remove(file: Attached) {
    setFiles((current) => current.filter((f) => f.path !== file.path));
    URL.revokeObjectURL(file.previewUrl);
    await createSupabaseBrowserClient().storage.from("message-attachments").remove([file.path]);
  }

  const error = state.error ?? uploadError;

  return (
    <form ref={formRef} action={formAction} className="border-t border-border px-4 py-3 md:px-6">
      <input type="hidden" name="conversationId" value={conversationId} />
      <input type="hidden" name="viewer" value={viewer} />
      {files.map((f) => (
        <input
          key={f.path}
          type="hidden"
          name="attachment"
          value={JSON.stringify({ path: f.path, kind: f.kind, name: f.name, size: f.size })}
        />
      ))}
      {error && (
        <p role="alert" className="mx-auto mb-2 max-w-2xl text-sm text-danger">
          {error}
        </p>
      )}
      {files.length > 0 && (
        <ul className="mx-auto mb-2 flex max-w-2xl flex-wrap gap-2">
          {files.map((f) => (
            <li key={f.path} className="relative size-16 overflow-hidden rounded-control bg-surface">
              {f.kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.previewUrl} alt={f.name} className="size-full object-cover" />
              ) : (
                <video src={f.previewUrl} muted className="size-full object-cover" />
              )}
              <button
                type="button"
                aria-label={`Remove ${f.name}`}
                onClick={() => void remove(f)}
                className="absolute top-0.5 right-0.5 grid size-5 place-items-center rounded-full bg-ink/70 text-white"
              >
                <CloseIcon className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="mx-auto flex max-w-2xl items-end gap-2">
        {!isMockMode && (
          <>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={[...IMAGE_TYPES, ...VIDEO_TYPES].join(",")}
              className="sr-only"
              tabIndex={-1}
              onChange={(event) => event.target.files && void upload(event.target.files)}
            />
            <button
              type="button"
              aria-label="Attach images or videos"
              disabled={uploading || files.length >= MAX_FILES}
              onClick={() => inputRef.current?.click()}
              className="grid size-11 shrink-0 place-items-center rounded-control border border-border text-graphite transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
            >
              <UploadIcon className="size-[18px]" />
            </button>
          </>
        )}
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
              if (canSend) formRef.current?.requestSubmit();
            }
          }}
          placeholder={uploading ? "Uploading…" : "Write a message…"}
          className="field-sizing-content max-h-40 min-h-11 flex-1 resize-none rounded-control border border-border bg-white px-3.5 py-2.5 text-base text-ink placeholder:text-muted hover:border-muted/50 focus:border-primary focus:ring-3 focus:ring-primary/15 focus:outline-none focus-visible:outline-none md:text-sm"
        />
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send message"
          className="grid size-11 shrink-0 place-items-center rounded-control bg-primary text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-primary/40"
        >
          <SendIcon className="size-[18px]" />
        </button>
      </div>
    </form>
  );
}
