"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
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
const MAX_BYTES = 100 * 1024 * 1024;
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
  const t = useTranslations("app.editor.portfolio");
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { save, pending, result, setResult } = useSave();
  const isFull = items.length >= MAX_ITEMS;

  function upload() {
    if (!file) return setResult({ error: t("chooseFile") });
    if (!ACCEPTED.includes(file.type)) return setResult({ error: t("fileTypes") });
    if (file.size > MAX_BYTES) return setResult({ error: t("fileSize") });

    save(async () => {
      const supabase = createSupabaseBrowserClient();
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
      const path = `${creatorId}/${Date.now()}.${extension}`;
      const { error } = await supabase.storage
        .from("portfolio")
        .upload(path, file, { contentType: file.type });
      if (error) return { error: t("uploadFailed") };

      const result = await addPortfolioItem({
        mediaPath: path,
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
          <ul className="mt-3 flex flex-wrap gap-2" aria-label={t("removeItems")}>
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => save(() => deletePortfolioItem(item.id))}
                  className={buttonClass({ variant: "ghost", size: "sm" })}
                >
                  <TrashIcon className="size-4" />
                  {t("remove", { title: item.title ?? t("untitled") })}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-control bg-surface p-4">
        <p className="text-sm font-medium text-ink">
          {t("addWork", { count: items.length, max: MAX_ITEMS })}
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <input
            aria-label={t("titleAria")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("titlePlaceholder")}
            maxLength={120}
            className={rowInputClass}
          />
          <input
            aria-label={t("descAria")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("descPlaceholder")}
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
            {file ? t("change") : t("choose")}
          </button>
          {file && <span className="max-w-60 truncate text-sm text-graphite">{file.name}</span>}
          <button
            type="button"
            disabled={isMockMode || isFull || pending || !file}
            onClick={upload}
            className={buttonClass({ size: "sm" })}
          >
            <UploadIcon className="size-4" />
            {pending ? t("uploading") : t("upload")}
          </button>
        </div>
        <p className="mt-2 text-xs text-muted">
          {isMockMode ? t("mockNote") : isFull ? t("full", { max: MAX_ITEMS }) : t("help")}
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
