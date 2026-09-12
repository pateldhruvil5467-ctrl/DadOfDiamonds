"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { SearchIcon, UserIcon, BagIcon } from "@/components/icons";
import { MobileNav } from "@/components/mobile-nav";
import { CartBadge } from "@/components/cart-badge";

// Full depth used by the mobile drawer; the desktop bar itself stays deliberately minimal
// (see PRIMARY_LINKS below) — a luxury header is not where exhaustive category navigation
// lives, that's what the /products filter bar is for.
export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Collections", href: "/products" },
  { label: "Rings", href: "/products?category=rings" },
  { label: "Earrings", href: "/products?category=earrings" },
  { label: "Necklaces", href: "/products?category=chains-necklaces" },
  { label: "Bracelets", href: "/products?category=bracelets" },
  { label: "Craft", href: "/#craft" },
  { label: "Story", href: "/#story" },
];

const PRIMARY_LINKS = [
  { label: "Collections", href: "/products" },
  { label: "Craft", href: "/#craft" },
  { label: "Story", href: "/#story" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let wasScrolled = false;
    function onScroll() {
      const isScrolled = window.scrollY > 60;
      if (isScrolled !== wasScrolled) {
        wasScrolled = isScrolled;
        setScrolled(isScrolled);
      }
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-700 ${
        scrolled ? "bg-background/92 backdrop-blur-md border-b border-border" : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-6">
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-9 text-[11px] tracking-[0.24em] uppercase">
            {PRIMARY_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="link-reveal text-foreground/90 hover:text-foreground transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex lg:justify-self-center col-start-1 lg:col-start-2 justify-self-start">
          <Link href="/">
            <BrandLogo />
          </Link>
        </div>

        <div className="col-start-3 flex items-center justify-end gap-6">
          <Link href="/products" aria-label="Search products" className="hidden lg:inline-flex p-1 hover:text-accent transition-colors">
            <SearchIcon className="h-[18px] w-[18px]" />
          </Link>
          <Link href="/account" aria-label="Your account" className="hidden lg:inline-flex p-1 hover:text-accent transition-colors">
            <UserIcon className="h-[18px] w-[18px]" />
          </Link>
          <Link href="/cart" aria-label="Your cart" className="relative inline-flex p-1 hover:text-accent transition-colors">
            <BagIcon className="h-[18px] w-[18px]" />
            <CartBadge />
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
