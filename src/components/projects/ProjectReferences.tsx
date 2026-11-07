import { useTranslations } from "next-intl";
import type { ProjectReference } from "@/types/projects";

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

/** Links and images the company attached to a project. Nothing when there are none. */
export function ProjectReferences({ references }: { references: ProjectReference[] | undefined }) {
  const t = useTranslations("app.projects.references");
  const links = (references ?? []).filter((r) => r.kind === "link");
  const images = (references ?? []).filter((r) => r.kind === "image");
  if (links.length + images.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="mb-2 text-sm font-semibold text-ink">{t("title")}</h2>
      {links.length > 0 && (
        <ul className="space-y-1.5">
          {links.map((link) => (
            <li key={link.id}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-sm font-medium break-all text-primary hover:text-primary-hover"
              >
                {hostOf(link.url)} ↗
              </a>
              <span className="ml-2 text-xs break-all text-muted">{link.url}</span>
            </li>
          ))}
        </ul>
      )}
      {images.length > 0 && (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image) => (
            <li key={image.id}>
              <a href={image.url} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL */}
                <img
                  src={image.url}
                  alt={t("imageAlt")}
                  loading="lazy"
                  className="aspect-square w-full rounded-card border border-border object-cover"
                />
              </a>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-xs text-muted">{t("note")}</p>
    </div>
  );
}
