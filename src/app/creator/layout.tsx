import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AccountPaused } from "@/components/layout/AccountPaused";
import { WrongAccountType } from "@/components/layout/WrongAccountType";
import { isMockMode } from "@/lib/config";
import { getOwnCreatorSummary } from "@/lib/data/creatorAccount";
import { getCurrentRole, getSupabaseSession } from "@/lib/data/session";

/** Access check for the whole creator area (/creator/…). */
export default async function CreatorAreaLayout({ children }: { children: React.ReactNode }) {
  await connection();
  if (isMockMode) return children;

  const { user } = await getSupabaseSession();
  if (!user) redirect("/login");
  if ((await getCurrentRole()) !== "creator") return <WrongAccountType areaName="creators" />;

  const creator = await getOwnCreatorSummary();
  if (creator && creator.status !== "active") return <AccountPaused status={creator.status} />;

  return children;
}
