"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { SocialPlatform } from "@/types/creator";
import type { CreatorEditorData } from "@/types/creatorEditor";
import { saveSocialAccounts } from "@/lib/actions/creatorProfile";
import { PLATFORM_LABELS, PLATFORM_OPTIONS } from "@/lib/discovery/filterConfig";
import { buttonClass } from "@/components/ui/buttonStyles";
import { PlusIcon, TrashIcon } from "@/components/ui/icons";
import { SaveRow, rowInputClass, rowRemoveClass } from "./EditorSection";
import { useSave } from "./useSave";

type Row = CreatorEditorData["socialAccounts"][number];

/**
 * Social accounts. Follower count is optional — UGC creators can leave it empty
 * and their card simply won't show an audience.
 */
export function SocialAccountsEditor({ initialRows }: { initialRows: Row[] }) {
  const t = useTranslations("app.editor.social");
  const [rows, setRows] = useState<Row[]>(initialRows);
  const { save, pending, result } = useSave();

  const update = (index: number, patch: Partial<Row>) =>
    setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  return (
    <div>
      <ul className="space-y-3">
        {rows.map((row, index) => (
          <li
            key={row.id ?? `new-${index}`}
            className="grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[9rem_1fr_1fr_8rem_auto]"
          >
            <select
              aria-label={t("platform")}
              value={row.platform}
              onChange={(e) => update(index, { platform: e.target.value as SocialPlatform })}
              className={rowInputClass}
            >
              {PLATFORM_OPTIONS.map((platform) => (
                <option key={platform} value={platform}>
                  {PLATFORM_LABELS[platform]}
                </option>
              ))}
            </select>
            <button
              type="button"
              aria-label={t("remove")}
              onClick={() => setRows((current) => current.filter((_, i) => i !== index))}
              className={`${rowRemoveClass} sm:order-last`}
            >
              <TrashIcon className="size-4" />
            </button>
            <input
              aria-label={t("handle")}
              value={row.handle}
              onChange={(e) => update(index, { handle: e.target.value })}
              placeholder="@handle"
              className={`${rowInputClass} col-span-2 sm:col-span-1`}
            />
            <input
              aria-label={t("link")}
              type="url"
              value={row.profileUrl}
              onChange={(e) => update(index, { profileUrl: e.target.value })}
              placeholder="https://…"
              className={`${rowInputClass} col-span-2 sm:col-span-1`}
            />
            <input
              aria-label={t("followersAria")}
              type="number"
              inputMode="numeric"
              min={0}
              value={row.followerCount ?? ""}
              onChange={(e) =>
                update(index, {
                  followerCount: e.target.value === "" ? null : Number(e.target.value),
                })
              }
              placeholder={t("followers")}
              className={`${rowInputClass} col-span-2 sm:col-span-1`}
            />
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() =>
          setRows((current) => [
            ...current,
            { platform: "instagram", handle: "", profileUrl: "", followerCount: null },
          ])
        }
        className={buttonClass({ variant: "ghost", size: "sm", className: "mt-3 -ml-3" })}
      >
        <PlusIcon className="size-4" />
        {t("add")}
      </button>
      <SaveRow
        pending={pending}
        result={result}
        onSave={() => save(() => saveSocialAccounts(rows))}
      />
    </div>
  );
}
