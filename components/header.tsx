"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { SearchIcon, UserIcon, BagIcon } from "@/components/icons";
import { MobileNav } from "@/components/mobile-nav";
import { CartBadge } from "@/components/cart-badge";

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Collections", href: "/products" },
  { label: "Rings", href: "/products?category=rings" },
  { label: "Earrings", href: "/products?category=earrings" },
  { label: "Necklaces", href: "/products?category=chains-necklaces" },
  { label: "Bracelets", href: "/products?category=bracelets" },
  { label: "About", href: "/#story" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let wasScrolled = false;
    function onScroll() {
      const isScrolled = window.scrollY > 48;
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
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled ? "bg-background border-b border-border" : "bg-background/30 backdrop-blur-sm border-b border-transparent"
      }`}
    >
      <div className="hidden md:block border-b border-border/60">
        <div className="mx-auto max-w-7xl px-6 py-2 flex items-center justify-between text-[11px] tracking-[0.2em] uppercase text-muted">
          <span>Surat — The Diamond City</span>
          <span>Crafted with Precision · Worldwide Delivery</span>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="shrink-0">
          <BrandLogo />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-8 text-xs tracking-[0.15em] uppercase text-foreground">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="link-reveal hover:text-accent transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-5">
          <Link href="/products" aria-label="Search products" className="hidden sm:inline-flex p-1 hover:text-accent transition-colors">
            <SearchIcon className="h-5 w-5" />
          </Link>
          <Link href="/account" aria-label="Your account" className="hidden sm:inline-flex p-1 hover:text-accent transition-colors">
            <UserIcon className="h-5 w-5" />
          </Link>
          <Link href="/cart" aria-label="Your cart" className="relative inline-flex p-1 hover:text-accent transition-colors">
            <BagIcon className="h-5 w-5" />
            <CartBadge />
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
