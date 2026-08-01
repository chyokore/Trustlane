import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link aria-label="TrustLane home" className="inline-flex items-center" href="/">
      <Image alt="TrustLane" className="h-8 w-auto" height={32} priority src="/brand/trustlane-wordmark.svg" width={130} />
    </Link>
  );
}
