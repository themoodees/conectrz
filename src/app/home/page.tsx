import { redirect } from "next/navigation";
import { isMockMode } from "@/lib/config";
import { getCurrentRole } from "@/lib/data/session";
import { HOME_PATHS } from "@/lib/roles";

/** Sends signed-in users to the right area for their account type. */
export default async function HomeRedirect() {
  if (isMockMode) redirect(HOME_PATHS.company);
  const role = await getCurrentRole();
  redirect(role ? HOME_PATHS[role] : "/login");
}
