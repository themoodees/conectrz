import type { SVGProps } from "react";
import {
  BellIcon,
  BookmarkIcon,
  BriefcaseIcon,
  CompassIcon,
  FlagIcon,
  MessageIcon,
  SettingsIcon,
  SlidersIcon,
  UploadIcon,
} from "@/components/ui/icons";

export interface NavItem {
  /** English fallback label (used as-is for admin items). */
  label: string;
  /** Key under `app.nav` in the message files; overrides `label` when set. */
  labelKey?:
    "discover" | "projects" | "saved" | "messages" | "myProfile" | "accountSettings" | "plans";
  href: string;
  icon: (props: SVGProps<SVGSVGElement>) => React.JSX.Element;
  /** URL prefixes that highlight this item. */
  activeFor: string[];
}

/*
 * Navigation for each area of the app. Edit labels/order here.
 */

export const COMPANY_NAV: NavItem[] = [
  {
    label: "Discover",
    labelKey: "discover",
    href: "/discover",
    icon: CompassIcon,
    activeFor: ["/discover", "/creators"],
  },
  {
    label: "Projects",
    labelKey: "projects",
    href: "/projects",
    icon: BriefcaseIcon,
    activeFor: ["/projects"],
  },
  { label: "Saved", labelKey: "saved", href: "/saved", icon: BookmarkIcon, activeFor: ["/saved"] },
  {
    label: "Messages",
    labelKey: "messages",
    href: "/messages",
    icon: MessageIcon,
    activeFor: ["/messages"],
  },
];

export const CREATOR_NAV: NavItem[] = [
  {
    label: "Projects",
    labelKey: "projects",
    href: "/creator/projects",
    icon: BriefcaseIcon,
    activeFor: ["/creator/projects"],
  },
  {
    label: "Messages",
    labelKey: "messages",
    href: "/creator/messages",
    icon: MessageIcon,
    activeFor: ["/creator/messages"],
  },
  {
    label: "My profile",
    labelKey: "myProfile",
    href: "/creator/profile",
    icon: UploadIcon,
    activeFor: ["/creator/profile"],
  },
];

export const ADMIN_NAV: NavItem[] = [
  { label: "Reports", href: "/admin/reports", icon: FlagIcon, activeFor: ["/admin/reports"] },
  {
    label: "Accounts",
    href: "/admin/accounts",
    icon: SettingsIcon,
    activeFor: ["/admin/accounts"],
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: SlidersIcon,
    activeFor: ["/admin/categories"],
  },
  { label: "Plans", href: "/admin/plans", icon: BookmarkIcon, activeFor: ["/admin/plans"] },
  { label: "Activity", href: "/admin/activity", icon: CompassIcon, activeFor: ["/admin/activity"] },
  { label: "Reminders", href: "/admin/reminders", icon: BellIcon, activeFor: ["/admin/reminders"] },
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
    {
      label: "Account settings",
      labelKey: "accountSettings",
      href: "/settings",
      icon: SettingsIcon,
    },
    { label: "Plans", labelKey: "plans", href: "/plans", icon: BookmarkIcon },
  ],
  creator: [
    {
      label: "Account settings",
      labelKey: "accountSettings",
      href: "/creator/settings",
      icon: SettingsIcon,
    },
  ],
  admin: [],
};

export const isNavItemActive = (pathname: string, activeFor: readonly string[]) =>
  activeFor.some((prefix) => pathname.startsWith(prefix));
