"use client";

import { useState } from "react";
import Link from "next/link";
import { MenuIcon, CloseIcon } from "@/components/icons";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Rings", href: "/products?category=rings" },
  { label: "Earrings", href: "/products?category=earrings" },
  { label: "Chains & Necklaces", href: "/products?category=chains-necklaces" },
  { label: "Bracelets", href: "/products?category=bracelets" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? "Close menu" : "Open menu"}
        className="p-2 -mr-2"
      >
        {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
      </button>

      {open && (
        <nav id="mobile-nav-panel" aria-label="Mobile" className="absolute inset-x-0 top-full bg-background border-b border-border">
          <ul className="flex flex-col px-6 py-4">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 text-sm tracking-wide border-b border-border last:border-none"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
