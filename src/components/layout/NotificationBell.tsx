import { getNotificationFeed } from "@/lib/data/notifications";
import type { NotificationArea } from "@/types/notifications";
import { NotificationMenu } from "./NotificationMenu";

/** Bell with the latest notifications for the company and creator areas. */
export async function NotificationBell({ area }: { area: NotificationArea }) {
  const feed = await getNotificationFeed(area);
  return <NotificationMenu items={feed.items} unreadCount={feed.unreadCount} />;
}
