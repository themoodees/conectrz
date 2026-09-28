"use client";

import Image from "next/image";
import { useState } from "react";
import { getInitials } from "@/lib/format";

/**
 * Creator photo with a consistent 4:5 ratio.
 * Falls back to initials if the photo is missing or fails to load.
 */
export function CreatorImage({ src, name }: { src: string | null; name: string }) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative aspect-[4/5] overflow-hidden bg-surface">
      {src && !hasError ? (
        <Image
          src={src}
          alt={name}
          fill
          sizes="(min-width: 1280px) 300px, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="grid size-full place-items-center">
          <span className="font-display text-4xl font-semibold text-muted">
            {getInitials(name)}
          </span>
        </div>
      )}
    </div>
  );
}
