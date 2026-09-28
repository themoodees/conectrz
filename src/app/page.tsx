import { redirect } from "next/navigation";

// The public homepage isn't built yet — send visitors to Creator Discovery.
export default function Home() {
  redirect("/discover");
}
