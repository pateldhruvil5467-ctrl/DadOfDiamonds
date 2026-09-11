"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { MenuIcon, CloseIcon } from "@/components/icons";
import { DiamondMark } from "@/components/brand-logo";
import { NAV_LINKS } from "@/components/header";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
        aria-label="Open menu"
        className="p-2 -mr-2"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      {/* Rendered via a portal into document.body — the header applies `backdrop-blur` in its
          unscrolled state, which (like `transform`/`filter`) creates a new containing block for
          `fixed`-positioned descendants. Left nested inside the header, this drawer would be
          sized relative to the header's own box instead of the viewport. Portaling escapes it. */}
      {mounted &&
        createPortal(
          <>
            <div
              className={`fixed inset-0 z-[60] bg-black/80 transition-opacity duration-500 ${
                open ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />

            <div
              id="mobile-nav-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              className={`fixed inset-y-0 right-0 z-[70] w-[82%] max-w-sm bg-surface border-l border-border transition-transform duration-500 ease-[var(--ease-luxury)] ${
                open ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                <DiamondMark className="h-7 w-7" />
                <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="p-2 -mr-2">
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>

              <nav aria-label="Mobile" className="px-6 py-8">
                <ul className="flex flex-col">
                  {NAV_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="block py-4 font-display text-2xl border-b border-border last:border-none hover:text-accent transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="mt-10 flex flex-col gap-4 text-xs uppercase tracking-[0.2em] text-muted">
                  <Link href="/account" onClick={() => setOpen(false)} className="hover:text-accent transition-colors">
                    Your Account
                  </Link>
                  <p>Surat — The Diamond City</p>
                </div>
              </nav>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
