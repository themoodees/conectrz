import Link from "next/link";
import { buttonClass } from "@/components/ui/buttonStyles";

export default function CreatorNotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold text-ink">Creator not found</h1>
      <p className="mt-2 text-muted">This profile may have been removed or paused.</p>
      <Link href="/discover" className={buttonClass({ className: "mt-6" })}>
        Back to Discover
      </Link>
    </div>
  );
}
