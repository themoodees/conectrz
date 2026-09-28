"use client";

import { useRef, useState } from "react";
import type { CreatorEditorData } from "@/types/creatorEditor";
import { isMockMode } from "@/lib/config";
import { addPortfolioItem, deletePortfolioItem } from "@/lib/actions/creatorProfile";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { PortfolioGrid } from "@/components/creator/PortfolioGrid";
import { buttonClass } from "@/components/ui/buttonStyles";
import { TrashIcon, UploadIcon } from "@/components/ui/icons";
import { rowInputClass } from "./EditorSection";
import { useSave } from "./useSave";

const MAX_ITEMS = 20;
const MAX_BYTES = 50 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime"];

/**
 * Portfolio: upload images/videos (bucket "portfolio", creator's own folder)
 * and remove items. Up to 20 items (enforced by the database too).
 */
export function PortfolioEditor({
  creatorId,
  items,
}: {
  creatorId: string;
  items: CreatorEditorData["portfolio"];
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { save, pending, result, setResult } = useSave();
  const isFull = items.length >= MAX_ITEMS;

  function upload() {
    if (!file) return setResult({ error: "Choose a file first." });
    if (!ACCEPTED.includes(file.type))
      return setResult({ error: "Use JPG, PNG, WebP, MP4 or MOV." });
    if (file.size > MAX_BYTES) return setResult({ error: "Files can be up to 50 MB." });

    save(async () => {
      const supabase = createSupabaseBrowserClient();
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
      const path = `${creatorId}/${Date.now()}.${extension}`;
      const { error } = await supabase.storage
        .from("portfolio")
        .upload(path, file, { contentType: file.type });
      if (error) return { error: "Upload failed. Please try again." };

      const { data } = supabase.storage.from("portfolio").getPublicUrl(path);
      const result = await addPortfolioItem({
        mediaUrl: data.publicUrl,
        mediaType: file.type,
        title,
        description,
      });
      if (!result.error) {
        setFile(null);
        setTitle("");
        setDescription("");
      }
      return result;
    });
  }

  return (
    <div className="space-y-6">
      {items.length > 0 && (
        <div>
          <PortfolioGrid items={items} />
          <ul className="mt-3 flex flex-wrap gap-2" aria-label="Remove portfolio items">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => save(() => deletePortfolioItem(item.id))}
                  className={buttonClass({ variant: "ghost", size: "sm" })}
                >
                  <TrashIcon className="size-4" />
                  Remove “{item.title ?? "Untitled"}”
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-control bg-surface p-4">
        <p className="text-sm font-medium text-ink">
          Add work ({items.length}/{MAX_ITEMS})
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <input
            aria-label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (e.g. Skincare Reel)"
            maxLength={120}
            className={rowInputClass}
          />
          <input
            aria-label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description (optional)"
            maxLength={500}
            className={rowInputClass}
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPTED.join(",")}
            className="sr-only"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            disabled={isMockMode || isFull}
            onClick={() => fileRef.current?.click()}
            className={buttonClass({ variant: "secondary", size: "sm" })}
          >
            {file ? "Change file" : "Choose file"}
          </button>
          {file && <span className="max-w-60 truncate text-sm text-graphite">{file.name}</span>}
          <button
            type="button"
            disabled={isMockMode || isFull || pending || !file}
            onClick={upload}
            className={buttonClass({ size: "sm" })}
          >
            <UploadIcon className="size-4" />
            {pending ? "Uploading…" : "Upload"}
          </button>
        </div>
        <p className="mt-2 text-xs text-muted">
          {isMockMode
            ? "Uploads are available in Supabase mode."
            : isFull
              ? "You've reached 20 items. Remove one to add another."
              : "Images (JPG, PNG, WebP) or videos (MP4, MOV), up to 50 MB."}
        </p>
        {result.error && (
          <p role="alert" className="mt-2 text-sm text-danger">
            {result.error}
          </p>
        )}
      </div>
    </div>
  );
}
