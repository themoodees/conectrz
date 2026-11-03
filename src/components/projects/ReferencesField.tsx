"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { isMockMode } from "@/lib/config";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { buttonClass } from "@/components/ui/buttonStyles";
import { CloseIcon, PlusIcon, UploadIcon } from "@/components/ui/icons";

const MAX_LINKS = 5;
const MAX_IMAGES = 6;
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

interface UploadedImage {
  path: string;
  previewUrl: string;
}

/**
 * References for a project brief: web links and images (mood boards, examples, product shots).
 * Images go straight from the browser to the private "project-references" bucket, in the
 * company's own folder; the form then submits their paths and the links as hidden/regular inputs.
 */
export function ReferencesField() {
  const [links, setLinks] = useState<string[]>([""]);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [status, setStatus] = useState<{ error?: string; pending?: boolean }>({});
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(files: FileList) {
    const room = MAX_IMAGES - images.length;
    const chosen = [...files].slice(0, room);
    if (files.length > room) setStatus({ error: `You can add up to ${MAX_IMAGES} images.` });
    else setStatus({ pending: true });

    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return setStatus({ error: "Please sign in again." });

    const added: UploadedImage[] = [];
    for (const file of chosen) {
      if (!ACCEPTED.includes(file.type)) {
        setStatus({ error: "Use JPG, PNG or WebP images." });
        continue;
      }
      if (file.size > MAX_BYTES) {
        setStatus({ error: "Each image can be up to 5 MB." });
        continue;
      }
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${data.user.id}/${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage
        .from("project-references")
        .upload(path, file, { contentType: file.type });
      if (error) {
        setStatus({ error: "Upload failed. Please try again." });
        continue;
      }
      added.push({ path, previewUrl: URL.createObjectURL(file) });
    }
    setImages((current) => [...current, ...added]);
    setStatus((current) => ({ error: current.error }));
  }

  async function remove(image: UploadedImage) {
    setImages((current) => current.filter((i) => i.path !== image.path));
    URL.revokeObjectURL(image.previewUrl);
    await createSupabaseBrowserClient().storage.from("project-references").remove([image.path]);
  }

  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-medium text-ink">References (optional)</legend>
      <p className="-mt-2 text-xs text-muted">
        Add links (a mood board, an Instagram account, a product page) and images that show the
        style you want. Creators see them on the project page.
      </p>

      <div className="space-y-2">
        {links.map((link, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="url"
              name="referenceLinks"
              value={link}
              maxLength={500}
              placeholder="https://…"
              aria-label={`Reference link ${index + 1}`}
              onChange={(e) =>
                setLinks((current) => current.map((l, i) => (i === index ? e.target.value : l)))
              }
              className="h-11 min-w-0 flex-1 rounded-control border border-border bg-white px-3 text-sm text-ink placeholder:text-muted hover:border-muted/50 focus:border-primary focus:ring-3 focus:ring-primary/15 focus:outline-none"
            />
            {links.length > 1 && (
              <button
                type="button"
                aria-label={`Remove link ${index + 1}`}
                onClick={() => setLinks((current) => current.filter((_, i) => i !== index))}
                className="grid size-11 place-items-center rounded-control text-graphite hover:bg-surface"
              >
                <CloseIcon className="size-4" />
              </button>
            )}
          </div>
        ))}
        {links.length < MAX_LINKS && (
          <button
            type="button"
            onClick={() => setLinks((current) => [...current, ""])}
            className={buttonClass({ variant: "ghost", size: "sm" })}
          >
            <PlusIcon className="size-4" />
            Add another link
          </button>
        )}
      </div>

      <div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED.join(",")}
          className="sr-only"
          onChange={(event) => {
            if (event.target.files?.length) void upload(event.target.files);
            event.target.value = "";
          }}
        />
        {images.length > 0 && (
          <ul className="mb-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {images.map((image) => (
              <li key={image.path} className="relative aspect-square overflow-hidden rounded-card">
                {/* Local preview of the file just uploaded, not a remote image. */}
                <Image src={image.previewUrl} alt="" fill unoptimized className="object-cover" />
                <button
                  type="button"
                  aria-label="Remove image"
                  onClick={() => void remove(image)}
                  className="absolute top-1.5 right-1.5 grid size-7 place-items-center rounded-full bg-white/95 text-graphite hover:text-danger"
                >
                  <CloseIcon className="size-4" />
                </button>
                <input type="hidden" name="referenceImages" value={image.path} />
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isMockMode || status.pending || images.length >= MAX_IMAGES}
          className={buttonClass({ variant: "secondary", size: "sm" })}
        >
          <UploadIcon className="size-4" />
          {status.pending ? "Uploading…" : "Add images"}
        </button>
        <p className="mt-2 text-xs text-muted">
          {isMockMode
            ? "Uploads are available in Supabase mode."
            : `Up to ${MAX_IMAGES} images, JPG, PNG or WebP, 5 MB each.`}
        </p>
        {status.error && (
          <p role="alert" className="mt-1 text-sm text-danger">
            {status.error}
          </p>
        )}
      </div>
    </fieldset>
  );
}
