import type { Metadata } from "next";
import { NoConversationSelected } from "@/components/messages/NoConversationSelected";

export const metadata: Metadata = { title: "Messages" };

export default function CompanyMessagesPage() {
  return <NoConversationSelected />;
}
