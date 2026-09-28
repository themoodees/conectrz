import Link from "next/link";

/** Title + optional tabs for admin pages. */
export function AdminPageHeader({
  title,
  description,
  tabs,
}: {
  title: string;
  description?: string;
  tabs?: { label: string; href: string; isActive: boolean; count?: number }[];
}) {
  return (
    <header className="pt-7 pb-6 md:pt-10">
      <h1 className="text-[1.75rem] leading-tight font-semibold text-ink md:text-3xl">{title}</h1>
      {description && <p className="mt-2 text-muted">{description}</p>}
      {tabs && (
        <nav aria-label={`${title} views`} className="mt-5 flex gap-1 border-b border-border">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={tab.isActive ? "page" : undefined}
              className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${
                tab.isActive
                  ? "border-primary text-ink"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-1.5 rounded-full bg-surface px-1.5 py-0.5 text-xs text-graphite">
                  {tab.count}
                </span>
              )}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

/** Colored status label for accounts. */
export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-surface text-graphite",
    paused: "bg-primary-light text-primary",
    deleted: "bg-danger-light text-danger",
    pending: "bg-primary-light text-primary",
    resolved: "bg-surface text-graphite",
  };
  const labels: Record<string, string> = { deleted: "banned" };
  return (
    <span
      className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold capitalize ${styles[status] ?? styles.active}`}
    >
      {labels[status] ?? status}
    </span>
  );
}
