import type { CreatorProfile } from "@/types/creator";
import {
  PROFICIENCY_LABELS,
  formatFollowers,
  formatLocation,
  formatRate,
} from "@/lib/format";
import { PLATFORM_LABELS } from "@/lib/discovery/filterConfig";
import { CreatorImage } from "@/components/discovery/CreatorImage";
import { MapPinIcon, PlatformIcon } from "@/components/ui/icons";
import { PortfolioGrid } from "./PortfolioGrid";

interface CreatorProfileViewProps {
  creator: CreatorProfile;
  /**
   * Company-only actions (contact/save/report). Omitted when a creator
   * previews their own profile.
   */
  actions?: React.ReactNode;
}

/**
 * Full Creator Profile. Layout: photo left (sticky on desktop), details right,
 * portfolio full-width below. On phones everything stacks.
 */
export function CreatorProfileView({ creator, actions }: CreatorProfileViewProps) {
  return (
    <>
      <div className="grid gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
        <div className="md:sticky md:top-24 md:self-start">
          <div className="overflow-hidden rounded-card">
            <CreatorImage src={creator.photoUrl} name={creator.displayName} />
          </div>
        </div>

        <div>
          <AvailabilityStatus isAvailable={creator.isAvailable} />
          <h1 className="mt-3 text-3xl leading-tight font-semibold text-ink md:text-4xl">
            {creator.displayName}
          </h1>
          <p className="mt-2 flex items-center gap-1.5 text-muted">
            <MapPinIcon className="size-4 shrink-0" />
            {formatLocation(creator)}
          </p>

          {actions && <div className="mt-6">{actions}</div>}

          <div className="mt-8 divide-y divide-border border-t border-border">
            {creator.bio && (
              <ProfileSection title="About">
                <p className="leading-relaxed whitespace-pre-line text-graphite">{creator.bio}</p>
              </ProfileSection>
            )}

            {creator.niches.length > 0 && (
              <ProfileSection title="Niches">
                <ul className="flex flex-wrap gap-2">
                  {creator.niches.map((niche) => (
                    <li
                      key={niche}
                      className="rounded-md bg-surface px-2.5 py-1 text-sm font-medium text-graphite"
                    >
                      {niche}
                    </li>
                  ))}
                </ul>
              </ProfileSection>
            )}

            {creator.languages.length > 0 && (
              <ProfileSection title="Languages">
                <ul className="flex flex-wrap gap-x-6 gap-y-2">
                  {creator.languages.map((language) => (
                    <li key={language.name} className="text-sm">
                      <span className="font-medium text-ink">{language.name}</span>{" "}
                      <span className="text-muted">
                        · {PROFICIENCY_LABELS[language.proficiency]}
                      </span>
                    </li>
                  ))}
                </ul>
              </ProfileSection>
            )}

            {creator.socialAccounts.length > 0 && (
              <ProfileSection title="Social presence">
                <ul className="space-y-3">
                  {creator.socialAccounts.map((account) => (
                    <li key={account.platform} className="flex items-center gap-3 text-sm">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface text-graphite">
                        <PlatformIcon platform={account.platform} className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium text-ink">
                          {PLATFORM_LABELS[account.platform]}
                        </span>
                        {account.profileUrl ? (
                          <a
                            href={account.profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="truncate text-muted hover:text-primary"
                          >
                            @{account.handle}
                          </a>
                        ) : (
                          <span className="truncate text-muted">@{account.handle}</span>
                        )}
                      </span>
                      {account.followerCount !== null && (
                        <span className="text-right">
                          <span className="block font-semibold text-ink">
                            {formatFollowers(account.followerCount)}
                          </span>
                          <span className="text-xs text-muted">followers</span>
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </ProfileSection>
            )}

            {creator.services.length > 0 && (
              <ProfileSection title="Services & rates">
                <ul className="divide-y divide-border rounded-card border border-border">
                  {creator.services.map((service) => (
                    <li
                      key={service.name}
                      className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                    >
                      <span className="text-ink">{service.name}</span>
                      <span className="shrink-0 font-semibold text-ink">{formatRate(service)}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-muted">Rates are set by the creator, in JPY.</p>
              </ProfileSection>
            )}
          </div>
        </div>
      </div>

      <section className="mt-14" aria-labelledby="portfolio-heading">
        <h2 id="portfolio-heading" className="mb-5 text-2xl font-semibold text-ink">
          Portfolio
        </h2>
        <PortfolioGrid items={creator.portfolio} />
      </section>
    </>
  );
}

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-6">
      <h2 className="mb-3 font-sans text-sm font-semibold tracking-normal text-ink">{title}</h2>
      {children}
    </section>
  );
}

function AvailabilityStatus({ isAvailable }: { isAvailable: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-graphite">
      <span
        aria-hidden="true"
        className={`size-1.5 rounded-full ${isAvailable ? "bg-success" : "bg-muted"}`}
      />
      {isAvailable ? "Available for new work" : "Currently unavailable"}
    </span>
  );
}
