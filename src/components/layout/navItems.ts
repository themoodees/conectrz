import { BookmarkIcon, CompassIcon, MessageIcon } from "@/components/ui/icons";

/** Company app navigation. Saved and Messages routes are not built yet. */
export const NAV_ITEMS = [
  { label: "Discover", href: "/discover", icon: CompassIcon },
  { label: "Saved", href: "/saved", icon: BookmarkIcon },
  { label: "Messages", href: "/messages", icon: MessageIcon },
] as const;
