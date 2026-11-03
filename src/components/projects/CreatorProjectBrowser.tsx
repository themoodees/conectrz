"use client";

import { useMemo, useState } from "react";
import type { CreatorProject } from "@/types/projects";
import type { NumberRange } from "@/types/discovery";
import { BriefcaseIcon, SearchIcon } from "@/components/ui/icons";
import { FilterDropdown } from "@/components/discovery/FilterDropdown";
import { OptionButton } from "@/components/discovery/OptionButton";
import { RangeSlider } from "@/components/discovery/RangeSlider";
import { ProjectCard } from "./ProjectCard";

type Deadline = "week" | "month" | "later";

const DEADLINES: { id: Deadline; label: string }[] = [
  { id: "week", label: "Within 7 days" },
  { id: "month", label: "Within 30 days" },
  { id: "later", label: "More than 30 days" },
];

const BUDGET_SLIDER = { min: 0, max: 3000, step: 50 };
const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

const unique = (lists: string[][]) => [...new Set(lists.flat())].sort((a, b) => a.localeCompare(b));

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

/** "Open projects" with search and filters (niche, service, language, budget, deadline). */
export function CreatorProjectBrowser({ projects }: { projects: CreatorProject[] }) {
  const [query, setQuery] = useState("");
  const [niches, setNiches] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [budget, setBudget] = useState<NumberRange | null>(null);
  const [deadline, setDeadline] = useState<Deadline | null>(null);

  const options = useMemo(
    () => ({
      niches: unique(projects.map((p) => p.niches)),
      services: unique(projects.map((p) => p.services)),
      languages: unique(projects.map((p) => p.languages)),
    }),
    [projects],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const any = (wanted: string[], have: string[]) =>
      wanted.length === 0 || wanted.some((w) => have.includes(w));
    return projects.filter((p) => {
      if (q && !`${p.title} ${p.description} ${p.companyName}`.toLowerCase().includes(q)) {
        return false;
      }
      if (!any(niches, p.niches) || !any(services, p.services) || !any(languages, p.languages)) {
        return false;
      }
      if (budget && (p.budgetUsd < budget.min || (budget.max !== null && p.budgetUsd > budget.max))) {
        return false;
      }
      if (deadline && !matchesDeadline(p, deadline)) return false;
      return true;
    });
  }, [projects, query, niches, services, languages, budget, deadline]);

  const toggle = (list: string[], set: (v: string[]) => void, value: string) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const multi = (
    label: string,
    items: string[],
    selected: string[],
    set: (v: string[]) => void,
  ) =>
    items.length > 0 && (
      <FilterDropdown label={label} selectedCount={selected.length} onClear={() => set([])}>
        <div className="flex max-w-xs flex-wrap gap-2">
          {items.map((item) => (
            <OptionButton
              key={item}
              label={item}
              isSelected={selected.includes(item)}
              onClick={() => toggle(selected, set, item)}
            />
          ))}
        </div>
      </FilterDropdown>
    );

  const activeCount =
    niches.length + services.length + languages.length + (budget ? 1 : 0) + (deadline ? 1 : 0);
  const clearAll = () => {
    setQuery("");
    setNiches([]);
    setServices([]);
    setLanguages([]);
    setBudget(null);
    setDeadline(null);
  };

  return (
    <section aria-labelledby="open-projects-heading">
      <h2 id="open-projects-heading" className="mb-4 text-lg font-semibold text-ink">
        Open projects
      </h2>

      {projects.length > 0 && (
        <div className="mb-5 space-y-3">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects"
              aria-label="Search projects by title, description or company"
              className="h-12 w-full rounded-control border border-border bg-white pr-4 pl-12 text-base text-ink placeholder:text-muted hover:border-muted/50 focus:border-primary focus:ring-3 focus:ring-primary/15 focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {multi("Niche", options.niches, niches, setNiches)}
            {multi("Service", options.services, services, setServices)}
            {multi("Language", options.languages, languages, setLanguages)}
            <FilterDropdown
              label="Budget"
              selectedCount={budget ? 1 : 0}
              onClear={() => setBudget(null)}
            >
              <RangeSlider
                label="Budget"
                {...BUDGET_SLIDER}
                value={budget}
                onChange={setBudget}
                format={usd}
              />
            </FilterDropdown>
            <FilterDropdown
              label="Deadline"
              selectedCount={deadline ? 1 : 0}
              onClear={() => setDeadline(null)}
            >
              <div className="flex max-w-xs flex-wrap gap-2">
                {DEADLINES.map((d) => (
                  <OptionButton
                    key={d.id}
                    label={d.label}
                    isSelected={deadline === d.id}
                    onClick={() => setDeadline(deadline === d.id ? null : d.id)}
                  />
                ))}
              </div>
            </FilterDropdown>
            {(activeCount > 0 || query) && (
              <button
                type="button"
                onClick={clearAll}
                className="h-10 rounded-control px-3 text-sm font-medium text-graphite hover:bg-surface"
              >
                Clear all
              </button>
            )}
          </div>
          <p className="text-sm text-muted" aria-live="polite">
            {visible.length} {visible.length === 1 ? "project" : "projects"}
          </p>
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
            {projects.length === 0 ? "No open projects right now" : "No projects match your filters"}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-muted">
            {projects.length === 0
              ? "New projects from companies will show up here."
              : "Try removing a filter or searching for something else."}
          </p>
        </div>
      )}
    </section>
  );
}
