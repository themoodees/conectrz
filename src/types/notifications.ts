export type NotificationArea = "company" | "creator";

/** A notification ready to show: text and link already worked out. */
export interface AppNotification {
  id: string;
  title: string;
  body: string | null;
  href: string;
  createdAt: string;
  isRead: boolean;
}

export interface NotificationFeed {
  items: AppNotification[];
  unreadCount: number;
}
