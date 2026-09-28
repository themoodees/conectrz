"use client";

import { useRef, useState } from "react";
import { isMockMode } from "@/lib/config";
import { setProfilePhoto } from "@/lib/actions/creatorProfile";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { CreatorImage } from "@/components/discovery/CreatorImage";
import { buttonClass } from "@/components/ui/buttonStyles";
import { UploadIcon } from "@/components/ui/icons";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

/**
 * Profile photo upload. Files go straight from the browser to Supabase Storage
 * (bucket "creator-photos", in the creator's own folder), then the URL is saved.
 */
export function PhotoUploader({
  creatorId,
  name,
  photoUrl,
}: {
  creatorId: string;
  name: string;
  photoUrl: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ error?: string; pending?: boolean }>({});

  async function upload(file: File) {
    if (!ACCEPTED.includes(file.type)) return setStatus({ error: "Use a JPG, PNG or WebP image." });
    if (file.size > MAX_BYTES) return setStatus({ error: "Images can be up to 5 MB." });

    setStatus({ pending: true });
    const supabase = createSupabaseBrowserClient();
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${creatorId}/${Date.now()}.${extension}`;
    const { error } = await supabase.storage
      .from("creator-photos")
      .upload(path, file, { contentType: file.type });
    if (error) return setStatus({ error: "Upload failed. Please try again." });

    const { data } = supabase.storage.from("creator-photos").getPublicUrl(path);
    const result = await setProfilePhoto(data.publicUrl);
    setStatus({ error: result.error });
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="w-40 overflow-hidden rounded-card">
        <CreatorImage src={photoUrl} name={name} />
      </div>
      <div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
            event.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isMockMode || status.pending}
          className={buttonClass({ variant: "secondary", size: "sm" })}
        >
          <UploadIcon className="size-4" />
          {status.pending ? "Uploading…" : photoUrl ? "Change photo" : "Upload photo"}
        </button>
        <p className="mt-2 text-xs text-muted">
          {isMockMode
            ? "Uploads are available in Supabase mode."
            : "A clear, well-lit photo of you. JPG, PNG or WebP, up to 5 MB."}
        </p>
        {status.error && (
          <p role="alert" className="mt-1 text-sm text-danger">
            {status.error}
          </p>
        )}
      </div>
    </div>
  );
}
