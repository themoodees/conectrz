import type { ReactNode } from "react";
import {
  BriefcaseIcon,
  CheckIcon,
  MapPinIcon,
  SearchIcon,
  SendIcon,
  StarIcon,
} from "@/components/ui/icons";

/*
 * Product previews for the homepage, drawn in code so they stay sharp on every screen.
 * They mirror the real screens in a simplified form and use made-up sample data
 * (no real creators). Decorative only, so hidden from screen readers.
 */

const TONES = [
  "bg-primary-light text-primary",
  "bg-[#fdecf5] text-[#c2307f]",
  "bg-[#fff0ec] text-[#d4553f]",
  "bg-[#eef6ff] text-[#2f6fb8]",
];

function Avatar({
  name,
  tone = 0,
  size = "size-10",
}: {
  name: string;
  tone?: number;
  size?: string;
}) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full text-sm font-semibold ${size} ${TONES[tone % TONES.length]}`}
    >
      {name[0]}
    </span>
  );
}

const chip =
  "rounded-lg border border-border bg-white px-2.5 py-1 text-xs font-medium text-graphite";
const chipOn =
  "rounded-lg border border-primary bg-primary-light px-2.5 py-1 text-xs font-medium text-primary";

/** A browser window around a preview. */
export function BrowserFrame({ url, children }: { url: string; children: ReactNode }) {
  return (
    <figure aria-hidden="true" className="select-none">
      <div className="overflow-hidden rounded-card border border-border bg-white shadow-popover">
        <div className="flex items-center gap-1.5 border-b border-border bg-surface px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
          <span className="ml-3 truncate rounded-md bg-white px-3 py-0.5 text-[11px] text-muted">
            {url}
          </span>
        </div>
        <div className="p-4 sm:p-5">{children}</div>
      </div>
      <figcaption className="mt-2 text-center text-[11px] text-muted">
        Preview with sample data
      </figcaption>
    </figure>
  );
}

const CREATORS = [
  { name: "Yui", place: "Tokyo", tags: "Beauty · Japanese, English", price: "$120" },
  { name: "Emma", place: "Osaka", tags: "Travel · English, Spanish", price: "$200" },
  { name: "Haruka", place: "Kyoto", tags: "Food & Drink · Japanese", price: "$90" },
  { name: "Daniel", place: "Tokyo", tags: "Fitness · English, Korean", price: "$150" },
];

/** The creator search: filters on top, results below. */
export function DiscoverPreview() {
  return (
    <BrowserFrame url="conectrz.com/discover">
      <div className="flex items-center gap-2 rounded-control border border-border px-3 py-2 text-sm text-muted">
        <SearchIcon className="size-4" />
        Search creators
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className={chipOn}>Beauty</span>
        <span className={chipOn}>Japanese</span>
        <span className={chip}>Platform</span>
        <span className={chip}>Price: under $300</span>
        <span className={chip}>More filters</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {CREATORS.map((c, i) => (
          <div key={c.name} className="rounded-card border border-border p-3">
            <div className="flex items-center gap-2.5">
              <Avatar name={c.name} tone={i} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{c.name}</p>
                <p className="flex items-center gap-1 text-[11px] text-muted">
                  <MapPinIcon className="size-3" />
                  {c.place}
                </p>
              </div>
            </div>
            <p className="mt-2.5 truncate text-[11px] text-graphite">{c.tags}</p>
            <p className="mt-1 text-xs text-muted">
              From <span className="font-semibold text-ink">{c.price}</span>
            </p>
          </div>
        ))}
      </div>
    </BrowserFrame>
  );
}

/** A creator profile: services, rates and reviews. */
export function ProfilePreview() {
  return (
    <BrowserFrame url="conectrz.com/creators/yui">
      <div className="flex items-center gap-4">
        <Avatar name="Yui" size="size-16" />
        <div>
          <p className="text-lg font-semibold text-ink">Yui</p>
          <p className="flex items-center gap-1 text-xs text-muted">
            <MapPinIcon className="size-3.5" />
            Tokyo · Japanese, English
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-graphite">
            <StarIcon className="size-3.5 text-amber-500" />
            <span className="font-semibold text-ink">5.0</span> from brands she worked with
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className={chip}>Beauty</span>
        <span className={chip}>Skincare</span>
        <span className={chip}>Lifestyle</span>
      </div>
      <ul className="mt-4 divide-y divide-border rounded-card border border-border text-sm">
        {[
          ["TikTok video", "$120"],
          ["Instagram Reel", "$180"],
          ["Product photos (5)", "$90"],
        ].map(([service, price]) => (
          <li key={service} className="flex justify-between px-3 py-2">
            <span className="text-graphite">{service}</span>
            <span className="font-semibold text-ink">{price}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 rounded-card bg-surface p-3 text-xs text-graphite">
        <div className="flex gap-0.5 text-amber-500">
          {[0, 1, 2, 3, 4].map((n) => (
            <StarIcon key={n} className="size-3" />
          ))}
        </div>
        <p className="mt-1.5">&ldquo;Delivered on time and the content performed well.&rdquo;</p>
      </div>
    </BrowserFrame>
  );
}

/** A conversation with an image reference. */
export function ChatPreview() {
  return (
    <BrowserFrame url="conectrz.com/messages">
      <div className="space-y-2.5 text-sm">
        <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-surface px-3.5 py-2 text-ink">
          Hi! We&apos;d love a short video for our new skincare line.
        </div>
        <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-white">
          Sounds great. Can you share a reference?
        </div>
        <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-surface p-2 text-ink">
          <div className="bg-brand-gradient grid h-24 place-items-center rounded-lg opacity-80">
            <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-medium text-graphite">
              reference.mp4
            </span>
          </div>
          <p className="px-1.5 pt-2 pb-0.5">Here&apos;s the style we like.</p>
        </div>
        <p className="text-right text-[11px] text-muted">Seen</p>
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-control border border-border px-3 py-2 text-sm text-muted">
        <span className="flex-1">Write a message…</span>
        <SendIcon className="size-4 text-primary" />
      </div>
    </BrowserFrame>
  );
}

/** A project brief with the payment methods. */
export function ProjectPreview() {
  return (
    <BrowserFrame url="conectrz.com/projects">
      <span className="rounded-md bg-primary-light px-2 py-0.5 text-[11px] font-medium text-primary">
        Open
      </span>
      <p className="mt-2 text-base font-semibold text-ink">Autumn skincare UGC videos</p>
      <p className="text-xs text-muted">Hanami Cosmetics (sample)</p>
      <p className="mt-2 text-xs leading-relaxed text-graphite">
        Three short vertical videos for our new sensitive-skin line. Natural light, real routine.
      </p>
      <div className="mt-3 flex gap-6 text-xs">
        <p className="text-muted">
          Budget <span className="font-semibold text-ink">$600</span>
        </p>
        <p className="text-muted">
          Deliver by <span className="font-semibold text-ink">Dec 15</span>
        </p>
      </div>
      <div className="mt-3 rounded-card bg-surface p-3">
        <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">
          How you&apos;ll be paid
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {["Bank transfer", "Wise"].map((m) => (
            <span
              key={m}
              className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-graphite"
            >
              <CheckIcon className="size-3 text-primary" />
              {m}
            </span>
          ))}
        </div>
      </div>
    </BrowserFrame>
  );
}

const PROJECTS = [
  { title: "Autumn skincare UGC videos", budget: "$600", tags: "Beauty · TikTok video" },
  { title: "Weekend trips: Reels series", budget: "$1,200", tags: "Travel · Instagram Reel" },
  { title: "Home organisation TikToks", budget: "$450", tags: "Home · TikTok video" },
];

/** The creator's project list with filters. */
export function ProjectsBrowsePreview() {
  return (
    <BrowserFrame url="conectrz.com/creator/projects">
      <div className="flex flex-wrap gap-2">
        <span className={chip}>Niche</span>
        <span className={chipOn}>Budget: $400+</span>
        <span className={chip}>Deadline</span>
        <span className={chip}>Sort: Newest</span>
      </div>
      <ul className="mt-4 space-y-3">
        {PROJECTS.map((p) => (
          <li key={p.title} className="rounded-card border border-border p-3">
            <div className="flex items-start gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary-light text-primary">
                <BriefcaseIcon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{p.title}</p>
                <p className="text-[11px] text-muted">{p.tags}</p>
              </div>
              <span className="text-sm font-semibold text-ink">{p.budget}</span>
            </div>
          </li>
        ))}
      </ul>
    </BrowserFrame>
  );
}

/** Apply to a project with a message and your price. */
export function ApplyPreview() {
  return (
    <BrowserFrame url="conectrz.com/creator/projects/autumn-skincare">
      <p className="text-sm font-semibold text-ink">Apply to this project</p>
      <div className="mt-3 rounded-control border border-border px-3 py-2 text-xs leading-relaxed text-graphite">
        Hi! I&apos;ve made skincare routines for two years and can deliver all three videos within
        two weeks.
      </div>
      <div className="mt-3 flex items-center justify-between rounded-control border border-border px-3 py-2 text-sm">
        <span className="text-muted">Your price</span>
        <span className="font-semibold text-ink">$550</span>
      </div>
      <div className="mt-3 rounded-card bg-surface p-3 text-xs text-graphite">
        <p className="font-semibold text-ink">You accept</p>
        <div className="mt-1.5 flex gap-2">
          {["Bank transfer", "PayPal"].map((m) => (
            <span key={m} className="rounded-lg bg-white px-2.5 py-1 font-medium">
              {m}
            </span>
          ))}
        </div>
      </div>
      <span className="mt-4 inline-flex h-9 items-center rounded-control bg-primary px-4 text-sm font-semibold text-white">
        Send application
      </span>
    </BrowserFrame>
  );
}
