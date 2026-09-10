import Link from "next/link";
import { SearchIcon, UserIcon, BagIcon } from "@/components/icons";
import { MobileNav } from "@/components/mobile-nav";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Rings", href: "/products?category=rings" },
  { label: "Earrings", href: "/products?category=earrings" },
  { label: "Chains & Necklaces", href: "/products?category=chains-necklaces" },
  { label: "Bracelets", href: "/products?category=bracelets" },
];

export function Header() {
  return (
    <header className="relative border-b border-border bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
        <Link href="/" className="font-display text-2xl tracking-wide">
          DAD OF DIAMONDS
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-8 text-sm tracking-wide text-foreground">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-accent transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/products" aria-label="Search products" className="hidden sm:inline-flex p-1">
            <SearchIcon className="h-5 w-5" />
          </Link>
          <Link href="/account" aria-label="Your account" className="hidden sm:inline-flex p-1">
            <UserIcon className="h-5 w-5" />
          </Link>
          <Link href="/cart" aria-label="Your cart" className="inline-flex p-1">
            <BagIcon className="h-5 w-5" />
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
