"use client";

import Image from "next/image";
import { useState } from "react";
import type { PortfolioItem } from "@/types/creator";

/** Creator's portfolio: images and videos in a consistent 4:5 grid. */
export function PortfolioGrid({ items }: { items: PortfolioItem[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-card border border-dashed border-border px-6 py-10 text-center text-sm text-muted">
        This creator hasn&apos;t added portfolio work yet.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <li key={item.id}>
          <PortfolioMedia item={item} />
          {item.title && <p className="mt-2 truncate text-sm font-medium text-ink">{item.title}</p>}
          {item.description && (
            <p className="truncate text-xs text-muted">{item.description}</p>
          )}
        </li>
      ))}
    </ul>
  );
}

function PortfolioMedia({ item }: { item: PortfolioItem }) {
  const [hasError, setHasError] = useState(false);
  const label = item.title ?? "Portfolio item";

  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-surface">
      {hasError ? (
        <div className="grid size-full place-items-center p-4 text-center text-xs text-muted">
          {label}
        </div>
      ) : item.mediaType.startsWith("video") ? (
        <video
          src={item.mediaUrl}
          controls
          preload="metadata"
          aria-label={label}
          className="size-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <Image
          src={item.mediaUrl}
          alt={label}
          fill
          sizes="(min-width: 1280px) 300px, (min-width: 768px) 33vw, 50vw"
          className="object-cover"
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}
