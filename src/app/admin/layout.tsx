import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AppHeader } from "@/components/layout/AppHeader";
import { WrongAccountType } from "@/components/layout/WrongAccountType";
import { isMockMode } from "@/lib/config";
import { getCurrentRole, getSupabaseSession } from "@/lib/data/session";

/** Admin panel shell. Admin accounts are created manually (profiles.role = 'admin'). */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await connection();

  let email = "admin@conectrz.example";
  if (!isMockMode) {
    const { user } = await getSupabaseSession();
    if (!user) redirect("/login");
    if ((await getCurrentRole()) !== "admin") return <WrongAccountType areaName="admins" />;
    email = user.email ?? "";
  }

  return (
    <>
      <AppHeader area="admin" areaLabel="Admin" account={{ name: "Admin", subtitle: email }} />
      <main>{children}</main>
    </>
  );
}
