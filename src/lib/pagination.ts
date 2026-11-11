/** Items per page for every paginated list. */
export const PAGE_SIZE = {
  discover: 40,
  saved: 40,
  accounts: 100,
  projects: 20,
  creatorProjects: 20,
  reports: 50,
} as const;

/** Reads a `?page=` value: a whole number of 1 or more, otherwise 1. */
export function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(page) && page >= 1 ? page : 1;
}

export interface Paged<T> {
  items: T[];
  /** The page actually shown (never past the last one). */
  page: number;
  totalPages: number;
  total: number;
}

export function paginate<T>(items: T[], page: number, size: number): Paged<T> {
  const totalPages = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(Math.max(1, page), totalPages);
  return {
    items: items.slice((current - 1) * size, current * size),
    page: current,
    totalPages,
    total: items.length,
  };
}

/** Page numbers to show: always the first, last and the pages around the current one, with gaps as null. */
export function pageNumbers(page: number, totalPages: number): (number | null)[] {
  const wanted = new Set([1, totalPages, page - 1, page, page + 1]);
  const pages = [...wanted].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
  const out: (number | null)[] = [];
  pages.forEach((n, i) => {
    if (i > 0 && n - pages[i - 1] > 1) out.push(null);
    out.push(n);
  });
  return out;
}
