import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NoConversationSelected } from "@/components/messages/NoConversationSelected";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app.inbox");
  return { title: t("title") };
}

export default function CompanyMessagesPage() {
  return <NoConversationSelected />;
}
