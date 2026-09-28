"use client";

import Image from "next/image";
import { useState } from "react";
import { getInitials } from "@/lib/format";

const SIZES = {
  sm: "size-9 text-xs",
  md: "size-11 text-sm",
};

/** Round photo with an initials fallback. */
export function Avatar({
  src,
  name,
  size = "md",
}: {
  src: string | null;
  name: string;
  size?: keyof typeof SIZES;
}) {
  const [hasError, setHasError] = useState(false);

  return (
    <span
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-surface font-semibold text-muted ${SIZES[size]}`}
    >
      {src && !hasError ? (
        <Image
          src={src}
          alt=""
          fill
          sizes="48px"
          className="object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        getInitials(name)
      )}
    </span>
  );
}
