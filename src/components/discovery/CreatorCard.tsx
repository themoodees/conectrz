import Link from "next/link";
import type { Creator } from "@/types/creator";
import {
  formatFollowers,
  formatJpy,
  formatLocation,
  getLowestRate,
} from "@/lib/format";
import { PLATFORM_LABELS } from "@/lib/discovery/filterConfig";
import {
  BookmarkIcon,
  LanguageIcon,
  MapPinIcon,
  PlatformIcon,
} from "@/components/ui/icons";
import { CreatorImage } from "./CreatorImage";

/* How much to show before collapsing into "+N". */
const MAX_NICHES = 2;
const MAX_SERVICES = 2;

interface CreatorCardProps {
  creator: Creator;
  isSaved: boolean;
  onToggleSave: (creatorId: string) => void;
}

/**
 * Discovery card: a quick "is this creator relevant?" summary — not a full profile.
 * Hierarchy: photo → name/location → niches → languages → audience → services/rate.
 * Audience only appears when a creator reports follower counts (UGC creators often don't).
 * The whole card links to the Creator Profile (via the name link); Save sits above it.
 */
export function CreatorCard({ creator, isSaved, onToggleSave }: CreatorCardProps) {
  const audience = creator.socialAccounts.filter((account) => account.followerCount !== null);
  const lowestRate = getLowestRate(creator.services);
  const showsFrom =
    creator.services.length > 1 || creator.services[0]?.rateType === "starting_from";

  return (
    <article className="group relative flex w-full flex-col overflow-hidden rounded-card border border-border bg-white shadow-card transition-shadow duration-200 hover:shadow-card-hover">
      {/* Image + overlays */}
      <div className="relative">
        <CreatorImage src={creator.photoUrl} name={creator.displayName} />

        <AvailabilityBadge isAvailable={creator.isAvailable} />

        <button
          type="button"
          onClick={() => onToggleSave(creator.id)}
          aria-pressed={isSaved}
          aria-label={isSaved ? `Remove ${creator.displayName} from saved` : `Save ${creator.displayName}`}
          className={`absolute top-3 right-3 z-10 grid size-9 place-items-center rounded-full transition-colors ${
            isSaved
              ? "bg-primary text-white hover:bg-primary-hover"
              : "bg-white/95 text-graphite hover:text-primary"
          }`}
        >
          <BookmarkIcon filled={isSaved} className="size-[18px]" />
        </button>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="truncate text-lg leading-tight font-semibold text-ink">
            <Link
              href={`/creators/${creator.id}`}
              className="after:absolute after:inset-0 after:rounded-card focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-primary"
            >
              {creator.displayName}
            </Link>
          </h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted">
            <MapPinIcon className="size-3.5 shrink-0" />
            <span className="truncate">{formatLocation(creator)}</span>
          </p>
        </div>

        {creator.niches.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Niches">
            {creator.niches.slice(0, MAX_NICHES).map((niche) => (
              <li
                key={niche}
                className="rounded-md bg-surface px-2 py-0.5 text-xs font-medium text-graphite"
              >
                {niche}
              </li>
            ))}
            {creator.niches.length > MAX_NICHES && (
              <li className="px-1 py-0.5 text-xs font-medium text-muted">
                +{creator.niches.length - MAX_NICHES}
              </li>
            )}
          </ul>
        )}

        <div className="space-y-1.5 text-sm text-graphite">
          <p className="flex items-center gap-1.5">
            <LanguageIcon className="size-3.5 shrink-0 text-muted" />
            <span className="sr-only">Languages:</span>
            <span className="truncate">
              {creator.languages.map((language) => language.name).join(" · ")}
            </span>
          </p>

          {audience.length > 0 && (
            <ul className="flex flex-wrap items-center gap-x-3 gap-y-1" aria-label="Audience">
              {audience.map((account) => (
                <li key={account.platform} className="flex items-center gap-1">
                  <PlatformIcon platform={account.platform} className="size-3.5 text-muted" />
                  <span className="sr-only">{PLATFORM_LABELS[account.platform]}:</span>
                  <span className="font-medium text-ink">
                    {formatFollowers(account.followerCount!)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Services + rate, pinned to the bottom so cards align in the grid */}
        {creator.services.length > 0 && (
          <div className="mt-auto flex items-end justify-between gap-3 border-t border-border pt-3">
            <p className="min-w-0 truncate text-sm text-graphite">
              {creator.services
                .slice(0, MAX_SERVICES)
                .map((service) => service.name)
                .join(", ")}
              {creator.services.length > MAX_SERVICES && (
                <span className="text-muted"> +{creator.services.length - MAX_SERVICES}</span>
              )}
            </p>
            {lowestRate !== null && (
              <p className="shrink-0 text-right text-sm leading-tight">
                {showsFrom && <span className="block text-xs text-muted">From</span>}
                <span className="font-semibold text-ink">{formatJpy(lowestRate)}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function AvailabilityBadge({ isAvailable }: { isAvailable: boolean }) {
  return (
    <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-graphite">
      <span
        aria-hidden="true"
        className={`size-1.5 rounded-full ${isAvailable ? "bg-success" : "bg-muted"}`}
      />
      {isAvailable ? "Available" : "Unavailable"}
    </span>
  );
}
