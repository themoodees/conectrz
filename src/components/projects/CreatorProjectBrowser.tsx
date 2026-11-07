"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ENABLED_LOCALES, LOCALE_LABELS, type Locale } from "@/i18n/config";
import type { CreatorProject, ProjectFormOptions } from "@/types/projects";
import type { NumberRange } from "@/types/discovery";
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/payments";
import { BriefcaseIcon, ChevronDownIcon, SearchIcon } from "@/components/ui/icons";
import { FilterChip } from "@/components/discovery/FilterChip";
import { FilterDropdown } from "@/components/discovery/FilterDropdown";
import { FilterPanel } from "@/components/discovery/FilterPanel";
import { MoreFiltersButton } from "@/components/discovery/FilterBar";
import { OptionButton } from "@/components/discovery/OptionButton";
import { RangeSlider } from "@/components/discovery/RangeSlider";
import { ProjectCard } from "./ProjectCard";

type Deadline = "week" | "month" | "later";
type Sort = "newest" | "budget" | "deadline";
type ListKey = "niches" | "services" | "languages";
type FilterId = ListKey | "written" | "payments" | "budget" | "deadline";

const DEADLINES: Deadline[] = ["week", "month", "later"];
const SORTS: Sort[] = ["newest", "budget", "deadline"];

const BUDGET_SLIDER = { min: 0, max: 3000, step: 50 };
const usd = (n: number) => `$${n.toLocaleString("en-US")}`;
const PRIMARY: FilterId[] = ["niches", "services", "budget"];
const SECONDARY: FilterId[] = ["written", "languages", "payments", "deadline"];
const ALL: FilterId[] = [...PRIMARY, ...SECONDARY];

/** Days from today until a yyyy-mm-dd deadline (can be negative). */
function daysUntil(isoDate: string) {
  const today = new Date();
  const start = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((Date.parse(`${isoDate}T00:00:00Z`) - start) / 86_400_000);
}

function matchesDeadline(project: CreatorProject, deadline: Deadline) {
  const days = daysUntil(project.deliveryDeadline);
  if (deadline === "week") return days <= 7;
  if (deadline === "month") return days <= 30;
  return days > 30;
}

/**
 * "Open projects" with search, filters and sorting, laid out like the company's creator search.
 * Every niche, service and language is offered (not only the ones in use) with the number of open
 * projects asking for it, most requested first, so creators can see what is in demand.
 */
export function CreatorProjectBrowser({
  projects,
  options,
}: {
  projects: CreatorProject[];
  options: ProjectFormOptions;
}) {
  const t = useTranslations("app.projects.browser");
  const tPay = useTranslations("app.payments.methods");
  const tf = useTranslations("app.filters");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("newest");
  const [selected, setSelected] = useState<Record<ListKey, string[]>>({
    niches: [],
    services: [],
    languages: [],
  });
  const [written, setWritten] = useState<Locale[]>([]);
  const [payments, setPayments] = useState<PaymentMethod[]>([]);
  const [budget, setBudget] = useState<NumberRange | null>(null);
  const [deadline, setDeadline] = useState<Deadline | null>(null);
  const [panel, setPanel] = useState<"more" | "all" | null>(null);

  /** Option names with how many open projects ask for each, most requested first. */
  const choices = useMemo(() => {
    const build = (key: ListKey) => {
      const counts = new Map<string, number>();
      projects.forEach((p) =>
        p[key].forEach((name) => counts.set(name, (counts.get(name) ?? 0) + 1)),
      );
      return options[key]
        .map((o) => ({ name: o.name, count: counts.get(o.name) ?? 0 }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    };
    return { niches: build("niches"), services: build("services"), languages: build("languages") };
  }, [projects, options]);

  const writtenCounts = useMemo(
    () =>
      ENABLED_LOCALES.map((code) => ({
        code,
        count: projects.filter((p) => p.writtenLanguage === code).length,
      })),
    [projects],
  );

  const paymentCounts = useMemo(
    () =>
      PAYMENT_METHODS.map((m) => ({
        ...m,
        count: projects.filter((p) => p.paymentMethods.includes(m.id)).length,
      })),
    [projects],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const any = (wanted: readonly string[], have: readonly string[]) =>
      wanted.length === 0 || wanted.some((w) => have.includes(w));
    const list = projects.filter((p) => {
      if (q && !`${p.title} ${p.description} ${p.companyName}`.toLowerCase().includes(q)) {
        return false;
      }
      if (
        !any(selected.niches, p.niches) ||
        !any(selected.services, p.services) ||
        !any(selected.languages, p.languages) ||
        !any(payments, p.paymentMethods) ||
        (written.length > 0 && !written.includes(p.writtenLanguage))
      ) {
        return false;
      }
      if (
        budget &&
        (p.budgetUsd < budget.min || (budget.max !== null && p.budgetUsd > budget.max))
      ) {
        return false;
      }
      return !deadline || matchesDeadline(p, deadline);
    });
    return list.sort((a, b) =>
      sort === "budget"
        ? b.budgetUsd - a.budgetUsd
        : sort === "deadline"
          ? a.deliveryDeadline.localeCompare(b.deliveryDeadline)
          : b.createdAt.localeCompare(a.createdAt),
    );
  }, [projects, query, selected, written, payments, budget, deadline, sort]);

  const toggle = <T extends string>(list: T[], value: T) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const countFor = (id: FilterId) =>
    id === "payments"
      ? payments.length
      : id === "written"
        ? written.length
        : id === "budget"
        ? budget
          ? 1
          : 0
        : id === "deadline"
          ? deadline
            ? 1
            : 0
          : selected[id].length;

  const clear = (ids: FilterId[] = ALL) => {
    ids.forEach((id) => {
      if (id === "payments") setPayments([]);
      else if (id === "written") setWritten([]);
      else if (id === "budget") setBudget(null);
      else if (id === "deadline") setDeadline(null);
      else setSelected((current) => ({ ...current, [id]: [] }));
    });
  };

  const section = (id: FilterId): ReactNode => {
    if (id === "budget") {
      return (
        <RangeSlider
          label={t("labels.budget")}
          {...BUDGET_SLIDER}
          value={budget}
          onChange={setBudget}
          format={usd}
        />
      );
    }
    if (id === "deadline") {
      return DEADLINES.map((d) => (
        <OptionButton
          key={d}
          label={t(`deadlines.${d}`)}
          isSelected={deadline === d}
          onClick={() => setDeadline(deadline === d ? null : d)}
        />
      ));
    }
    if (id === "written") {
      return writtenCounts.map((w) => (
        <OptionButton
          key={w.code}
          label={`${LOCALE_LABELS[w.code]} · ${w.count}`}
          isSelected={written.includes(w.code)}
          onClick={() => setWritten(toggle(written, w.code))}
        />
      ));
    }
    if (id === "payments") {
      return paymentCounts.map((m) => (
        <OptionButton
          key={m.id}
          label={`${tPay(m.id)} · ${m.count}`}
          isSelected={payments.includes(m.id)}
          onClick={() => setPayments(toggle(payments, m.id))}
        />
      ));
    }
    return choices[id].map((c) => (
      <OptionButton
        key={c.name}
        label={`${c.name} · ${c.count}`}
        isSelected={selected[id].includes(c.name)}
        onClick={() =>
          setSelected((current) => ({ ...current, [id]: toggle(current[id], c.name) }))
        }
      />
    ));
  };

  const chips = [
    ...(["niches", "services", "languages"] as const).flatMap((key) =>
      selected[key].map((name) => ({
        id: `${key}:${name}`,
        key: key as FilterId,
        label: name,
        remove: () => setSelected((c) => ({ ...c, [key]: c[key].filter((v) => v !== name) })),
      })),
    ),
    ...written.map((code) => ({
      id: `written:${code}`,
      key: "written" as FilterId,
      label: t("writtenIn", { language: LOCALE_LABELS[code] }),
      remove: () => setWritten((c) => c.filter((v) => v !== code)),
    })),
    ...payments.map((m) => ({
      id: `payments:${m}`,
      key: "payments" as FilterId,
      label: t("paysBy", { method: tPay(m) }),
      remove: () => setPayments((c) => c.filter((v) => v !== m)),
    })),
    ...(budget
      ? [
          {
            id: "budget",
            key: "budget" as FilterId,
            label: `${usd(budget.min)} – ${budget.max === null ? `${usd(BUDGET_SLIDER.max)}+` : usd(budget.max)}`,
            remove: () => setBudget(null),
          },
        ]
      : []),
    ...(deadline
      ? [
          {
            id: "deadline",
            key: "deadline" as FilterId,
            label: t(`deadlines.${deadline}`),
            remove: () => setDeadline(null),
          },
        ]
      : []),
  ];

  const panelIds = panel === "more" ? SECONDARY : ALL;
  const secondaryCount = SECONDARY.reduce((sum, id) => sum + countFor(id), 0);

  return (
    <section aria-labelledby="open-projects-heading">
      <h2 id="open-projects-heading" className="mb-4 text-lg font-semibold text-ink">
        {t("openProjects")}
      </h2>

      {projects.length > 0 && (
        <div className="mb-5 space-y-4">
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("searchPlaceholder")}
                  aria-label={t("searchAria")}
                  className="h-12 w-full rounded-control border border-border bg-white pr-4 pl-12 text-base text-ink placeholder:text-muted hover:border-muted/50 focus:border-primary focus:ring-3 focus:ring-primary/15 focus:outline-none"
                />
              </div>
              <MoreFiltersButton
                label={tf("filters")}
                count={chips.length}
                onClick={() => setPanel("all")}
                className="h-12 md:hidden"
              />
            </div>
            <div className="hidden flex-wrap items-center gap-2 md:flex">
              {PRIMARY.map((id) => (
                <FilterDropdown
                  key={id}
                  label={t(`labels.${id}`)}
                  selectedCount={countFor(id)}
                  onClear={() => clear([id])}
                >
                  <div className="flex max-h-72 max-w-xs flex-wrap gap-2 overflow-y-auto">
                    {section(id)}
                  </div>
                </FilterDropdown>
              ))}
              <MoreFiltersButton
                count={secondaryCount}
                onClick={() => setPanel("more")}
                label={tf("moreFilters")}
              />
            </div>
          </div>

          {chips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2" aria-label={t("activeFilters")}>
              {chips.map((chip) => (
                <FilterChip key={chip.id} label={chip.label} onRemove={chip.remove} />
              ))}
              <button
                type="button"
                onClick={() => clear()}
                className="ml-1 h-8 rounded-lg px-2 text-sm font-medium text-graphite underline-offset-4 hover:text-ink hover:underline"
              >
                {t("clearAll")}
              </button>
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-graphite" aria-live="polite">
              {t.rich("count", {
                count: visible.length,
                b: (chunks) => <span className="font-semibold text-ink">{chunks}</span>,
              })}
            </p>
            <label className="flex items-center gap-2 text-sm">
              <span className="hidden text-muted sm:inline">{t("sortBy")}</span>
              <span className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as Sort)}
                  aria-label={t("sortAria")}
                  className="h-9 appearance-none rounded-control border border-border bg-white pr-9 pl-3 font-medium text-ink hover:border-muted/50"
                >
                  {SORTS.map((s) => (
                    <option key={s} value={s}>
                      {t(`sorts.${s}`)}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted" />
              </span>
            </label>
          </div>

          <FilterPanel
            title={panel === "more" ? tf("moreFilters") : tf("filters")}
            isOpen={panel !== null}
            onClose={() => setPanel(null)}
            onClear={() => clear(panelIds)}
            canClear={panelIds.some((id) => countFor(id) > 0)}
            resultCount={visible.length}
            noun="project"
          >
            {panelIds.map((id) => (
              <fieldset key={id}>
                <legend className="mb-3 text-sm font-semibold text-ink">{t(`labels.${id}`)}</legend>
                {id === "budget" ? (
                  section(id)
                ) : (
                  <div className="flex flex-wrap gap-2">{section(id)}</div>
                )}
              </fieldset>
            ))}
          </FilterPanel>
        </div>
      )}

      {visible.length > 0 ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {visible.map((project) => (
            <li key={project.id}>
              <ProjectCard project={project} href={`/creator/projects/${project.id}`} showCompany />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center rounded-card border border-dashed border-border px-6 py-16 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-surface text-muted">
            <BriefcaseIcon className="size-5" />
          </span>
          <h3 className="mt-4 text-lg font-semibold text-ink">
            {projects.length === 0 ? t("noOpenTitle") : t("noMatchTitle")}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-muted">
            {projects.length === 0 ? t("noOpenText") : t("noMatchText")}
          </p>
        </div>
      )}
    </section>
  );
}
