"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { DiamondMark } from "@/components/brand-logo";
import { AdminNavLinks } from "@/components/admin/admin-nav-links";
import { AdminIdentity } from "@/components/admin/admin-identity";
import { MenuIcon, CloseIcon } from "@/components/admin/admin-icons";

export function AdminMobileNav({ name, email }: { name: string | null; email: string }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

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
        aria-controls="admin-mobile-nav-drawer"
        aria-label="Open admin menu"
        className="p-2 -ml-2"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      {mounted &&
        createPortal(
          <>
            <div
              className={`fixed inset-0 z-[60] bg-black/80 transition-opacity duration-300 ${
                open ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />

            <div
              id="admin-mobile-nav-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Admin navigation"
              className={`fixed inset-y-0 left-0 z-[70] flex w-[80%] max-w-xs flex-col justify-between border-r border-border bg-background-deep px-5 py-6 transition-transform duration-300 ease-[var(--ease-luxury)] ${
                open ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <div>
                <div className="flex items-center justify-between px-1 pb-8">
                  <div className="flex items-center gap-3">
                    <DiamondMark className="h-6 w-6 text-accent" />
                    <span className="font-display text-sm tracking-[0.14em] text-foreground">DAD OF DIAMONDS</span>
                  </div>
                  <button type="button" onClick={() => setOpen(false)} aria-label="Close admin menu" className="p-2 -mr-2">
                    <CloseIcon className="h-5 w-5" />
                  </button>
                </div>
                <nav aria-label="Admin">
                  <AdminNavLinks onNavigate={() => setOpen(false)} />
                </nav>
              </div>

              <AdminIdentity name={name} email={email} />
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
