import type { Metadata } from "next";
import Link from "next/link";
import { BriefcaseIcon, UploadIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Create an account" };

const CHOICES = [
  {
    href: "/signup/company",
    icon: BriefcaseIcon,
    title: "I'm a Brand or Agency",
    text: "Find and hire creators living in Japan.",
  },
  {
    href: "/signup/creator",
    icon: UploadIcon,
    title: "I'm a Creator",
    text: "Get discovered by brands and apply to projects.",
  },
];

export default function SignupChoicePage() {
  return (
    <>
      <h1 className="text-3xl font-semibold text-ink">What describes you best?</h1>
      <p className="mt-2 mb-8 text-muted">We&apos;ll set you up in the right place.</p>

      <div className="space-y-3">
        {CHOICES.map(({ href, icon: Icon, title, text }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 rounded-card border border-border p-5 transition-colors hover:border-primary hover:bg-primary-light"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-semibold text-ink">{title}</span>
              <span className="block text-sm text-muted">{text}</span>
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:text-primary-hover">
          Sign in
        </Link>
      </p>
    </>
  );
}
