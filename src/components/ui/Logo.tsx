import Link from "next/link";

/**
 * Conectrz wordmark — PLACEHOLDER.
 * Swap the mark + text for the final logo SVG when it's ready.
 * The gradient mark is one of the few intentional brand-gradient moments.
 */
export function Logo({ href = "/discover" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 rounded-md" aria-label="Conectrz home">
      <span
        aria-hidden="true"
        className="bg-brand-gradient grid size-7 place-items-center rounded-lg"
      >
        <span className="size-2.5 rounded-full bg-white" />
      </span>
      <span className="font-display text-[1.375rem] font-bold tracking-tight text-ink">
        conectrz
      </span>
    </Link>
  );
}
