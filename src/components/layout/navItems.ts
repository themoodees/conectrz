import { BookmarkIcon, CompassIcon, MessageIcon } from "@/components/ui/icons";

/**
 * Company app navigation.
 * `activeFor` lists the URL prefixes that highlight the item.
 */
export const NAV_ITEMS = [
  { label: "Discover", href: "/discover", icon: CompassIcon, activeFor: ["/discover", "/creators"] },
  { label: "Saved", href: "/saved", icon: BookmarkIcon, activeFor: ["/saved"] },
  { label: "Messages", href: "/messages", icon: MessageIcon, activeFor: ["/messages"] },
] as const;

export const isNavItemActive = (pathname: string, activeFor: readonly string[]) =>
  activeFor.some((prefix) => pathname.startsWith(prefix));
