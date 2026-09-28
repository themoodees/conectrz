import type { SVGProps } from "react";
import {
  BookmarkIcon,
  CompassIcon,
  FlagIcon,
  MessageIcon,
  SettingsIcon,
  SlidersIcon,
  UploadIcon,
} from "@/components/ui/icons";

export interface NavItem {
  label: string;
  href: string;
  icon: (props: SVGProps<SVGSVGElement>) => React.JSX.Element;
  /** URL prefixes that highlight this item. */
  activeFor: string[];
}

/*
 * Navigation for each area of the app. Edit labels/order here.
 */

export const COMPANY_NAV: NavItem[] = [
  { label: "Discover", href: "/discover", icon: CompassIcon, activeFor: ["/discover", "/creators"] },
  { label: "Saved", href: "/saved", icon: BookmarkIcon, activeFor: ["/saved"] },
  { label: "Messages", href: "/messages", icon: MessageIcon, activeFor: ["/messages"] },
];

export const CREATOR_NAV: NavItem[] = [
  { label: "Messages", href: "/creator/messages", icon: MessageIcon, activeFor: ["/creator/messages"] },
  { label: "My profile", href: "/creator/profile", icon: UploadIcon, activeFor: ["/creator/profile"] },
];

export const ADMIN_NAV: NavItem[] = [
  { label: "Reports", href: "/admin/reports", icon: FlagIcon, activeFor: ["/admin/reports"] },
  { label: "Accounts", href: "/admin/accounts", icon: SettingsIcon, activeFor: ["/admin/accounts"] },
  { label: "Categories", href: "/admin/categories", icon: SlidersIcon, activeFor: ["/admin/categories"] },
  { label: "Plans", href: "/admin/plans", icon: BookmarkIcon, activeFor: ["/admin/plans"] },
];

export type AppArea = "company" | "creator" | "admin";

export const NAV_BY_AREA: Record<AppArea, NavItem[]> = {
  company: COMPANY_NAV,
  creator: CREATOR_NAV,
  admin: ADMIN_NAV,
};

/** Links in the account dropdown (Sign out is always added). */
export const ACCOUNT_MENU_LINKS: Record<AppArea, Omit<NavItem, "activeFor">[]> = {
  company: [
    { label: "Account settings", href: "/settings", icon: SettingsIcon },
    { label: "Plans", href: "/plans", icon: BookmarkIcon },
  ],
  creator: [{ label: "Account settings", href: "/creator/settings", icon: SettingsIcon }],
  admin: [],
};

export const isNavItemActive = (pathname: string, activeFor: readonly string[]) =>
  activeFor.some((prefix) => pathname.startsWith(prefix));
