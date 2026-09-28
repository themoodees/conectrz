/** Account types (mirrors the `user_role` enum). */
export type UserRole = "company" | "creator" | "admin";

/** Where each account type lands after signing in. */
export const HOME_PATHS: Record<UserRole, string> = {
  company: "/discover",
  creator: "/creator",
  admin: "/admin",
};
