import Image from "next/image";
import Link from "next/link";

/** Conectrz wordmark (public/logo.png, 800×136). Sized by height so it stays crisp. */
export function Logo({ href = "/discover" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center rounded-md" aria-label="Conectrz home">
      <Image
        src="/logo.png"
        alt="conectrz"
        width={800}
        height={136}
        priority
        className="h-[26px] w-auto"
      />
    </Link>
  );
}
