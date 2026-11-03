import "server-only";
import type { AppNotification, NotificationArea, NotificationFeed } from "@/types/notifications";
import { isMockMode } from "@/lib/config";
import { MOCK_CREATOR_ID, mockCompanyAccount } from "@/mocks/account";
import { mockStore } from "@/mocks/store";
import { getSupabaseSession } from "./session";

/*
 * The bell in the header. Rows come from the `notifications` table, which database triggers fill:
 *   company: new_application, new_message, new_company_review
 *   creator: new_matching_project, application_declined, new_message, new_creator_review
 * (report_outcome rows exist but have nowhere to link to yet, so they are not listed.)
 */

const LIMIT = 15;
const LISTED_TYPES = [
  "new_message",
  "new_application",
  "application_declined",
  "new_matching_project",
  "new_creator_review",
  "new_company_review",
];

const inboxHref = (area: NotificationArea) =>
  area === "company" ? "/messages" : "/creator/messages";
const projectHref = (area: NotificationArea, id: string) =>
  area === "company" ? `/projects/${id}` : `/creator/projects/${id}`;

interface Row {
  id: string;
  type: string;
  payload: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
}

const stars = (n: unknown) =>
  typeof n === "number" ? `${"★".repeat(n)}${"☆".repeat(5 - n)}` : null;

function describe(
  row: Row,
  area: NotificationArea,
  titles: Map<string, string>,
): AppNotification | null {
  const base = { id: row.id, createdAt: row.created_at, isRead: Boolean(row.read_at) };
  const payload = row.payload ?? {};
  const projectId = typeof payload.project_id === "string" ? payload.project_id : null;
  const project = projectId ? (titles.get(projectId) ?? "a project") : null;

  switch (row.type) {
    case "new_message": {
      const conversationId =
        typeof payload.conversation_id === "string" ? `/${payload.conversation_id}` : "";
      return {
        ...base,
        title: "New message",
        body: null,
        href: `${inboxHref(area)}${conversationId}`,
      };
    }
    case "new_application":
      return projectId
        ? { ...base, title: "New application", body: project, href: projectHref(area, projectId) }
        : null;
    case "application_declined":
      return projectId
        ? {
            ...base,
            title: "Application not selected",
            body: project,
            href: projectHref(area, projectId),
          }
        : null;
    case "new_matching_project":
      return projectId
        ? {
            ...base,
            title: "New project for you",
            body: project,
            href: projectHref(area, projectId),
          }
        : null;
    case "new_creator_review":
      return {
        ...base,
        title: "You received a new review",
        body: stars(payload.rating),
        href: "/creator/profile/preview",
      };
    case "new_company_review":
      return {
        ...base,
        title: "You received a new review",
        body: stars(payload.rating),
        href: "/settings",
      };
    default:
      return null;
  }
}

function mockFeed(area: NotificationArea): NotificationFeed {
  const read = new Set(mockStore.readNotificationIds);
  const rows: Row[] = [];

  if (area === "company") {
    const mine = new Set(
      mockStore.projects.filter((p) => p.companyId === mockCompanyAccount.id).map((p) => p.id),
    );
    mockStore.applications
      .filter((a) => mine.has(a.projectId))
      .forEach((a) =>
        rows.push({
          id: `n-${a.id}`,
          type: "new_application",
          payload: { project_id: a.projectId },
          read_at: read.has(`n-${a.id}`) ? "x" : null,
          created_at: a.createdAt,
        }),
      );
  } else {
    const applied = new Set(
      mockStore.applications.filter((a) => a.creatorId === MOCK_CREATOR_ID).map((a) => a.projectId),
    );
    mockStore.projects
      .filter((p) => p.status === "open" && !applied.has(p.id))
      .forEach((p) =>
        rows.push({
          id: `n-${p.id}`,
          type: "new_matching_project",
          payload: { project_id: p.id },
          read_at: read.has(`n-${p.id}`) ? "x" : null,
          created_at: p.createdAt,
        }),
      );
  }

  if (area === "company") {
    mockStore.companyReviews
      .filter((r) => r.companyId === mockCompanyAccount.id)
      .forEach((r) =>
        rows.push({
          id: `n-${r.id}`,
          type: "new_company_review",
          payload: { rating: r.rating },
          read_at: read.has(`n-${r.id}`) ? "x" : null,
          created_at: r.createdAt,
        }),
      );
  } else {
    mockStore.reviews
      .filter((r) => r.creatorId === MOCK_CREATOR_ID)
      .forEach((r) =>
        rows.push({
          id: `n-${r.id}`,
          type: "new_creator_review",
          payload: { rating: r.rating },
          read_at: read.has(`n-${r.id}`) ? "x" : null,
          created_at: r.createdAt,
        }),
      );
  }

  mockStore.conversations
    .filter((c) => area === "company" || c.creatorId === MOCK_CREATOR_ID)
    .forEach((c) => {
      const last = c.messages.at(-1);
      const incoming = last && (area === "company" ? !last.fromCompany : last.fromCompany);
      if (last && incoming && !last.readAt) {
        rows.push({
          id: `n-${c.id}`,
          type: "new_message",
          payload: { conversation_id: c.id },
          read_at: null,
          created_at: last.createdAt,
        });
      }
    });

  const titles = new Map(mockStore.projects.map((p) => [p.id, p.title]));
  const items = rows
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .flatMap((row) => describe(row, area, titles) ?? [])
    .slice(0, LIMIT);
  return { items, unreadCount: items.filter((i) => !i.isRead).length };
}

export async function getNotificationFeed(area: NotificationArea): Promise<NotificationFeed> {
  if (isMockMode) return mockFeed(area);

  const { supabase, user } = await getSupabaseSession();
  if (!user) return { items: [], unreadCount: 0 };

  const [list, unread] = await Promise.all([
    supabase
      .from("notifications")
      .select("id, type, payload, read_at, created_at")
      .eq("user_id", user.id)
      .in("type", LISTED_TYPES as never[])
      .order("created_at", { ascending: false })
      .limit(LIMIT)
      .overrideTypes<Row[], { merge: false }>(),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .in("type", LISTED_TYPES as never[])
      .is("read_at", null),
  ]);
  if (list.error) return { items: [], unreadCount: 0 };

  const projectIds = [
    ...new Set(
      list.data.flatMap((r) =>
        typeof r.payload?.project_id === "string" ? [r.payload.project_id] : [],
      ),
    ),
  ];
  const titles = new Map<string, string>();
  if (projectIds.length > 0) {
    // Projects the user can't read (e.g. closed ones) fall back to "a project".
    const { data } = await supabase.from("projects").select("id, title").in("id", projectIds);
    data?.forEach((p) => titles.set(p.id, p.title));
  }

  return {
    items: list.data.flatMap((row) => describe(row, area, titles) ?? []),
    unreadCount: unread.count ?? 0,
  };
}
