"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/generated/prisma/client";

const META: Record<string, { icon: string; descriptor: string; index: string }> = {
  rings: { icon: "/categories/ring.svg", descriptor: "Symbols of forever", index: "01" },
  earrings: { icon: "/categories/earring.svg", descriptor: "Effortless brilliance", index: "02" },
  "chains-necklaces": { icon: "/categories/necklace.svg", descriptor: "Statement pieces", index: "03" },
  bracelets: { icon: "/categories/bracelet.svg", descriptor: "Everyday luxury", index: "04" },
};

// A fixed editorial order rather than the DB's alphabetical default — the categories read like
// chapters, not an arbitrary list.
const ORDER = ["rings", "earrings", "chains-necklaces", "bracelets"];

/**
 * The collection isn't a grid of boxed cards — it's a chapter list beside a single large visual
 * pane that quietly changes with the hovered/focused chapter, closer to an editorial index page
 * than a category picker. On touch/small screens there's no hover to depend on, so mobile gets
 * its own fully self-contained presentation (each chapter carries its own visual inline) rather
 * than a crippled version of the desktop interaction.
 */
export function CollectionSelector({ categories }: { categories: Category[] }) {
  const bySlug = new Map(categories.map((c) => [c.slug, c]));
  const ordered = ORDER.map((slug) => bySlug.get(slug)).filter((c): c is Category => Boolean(c));
  const [active, setActive] = useState(0);

  if (ordered.length === 0) return null;

  return (
    <>
      {/* Desktop / large tablet: chapter list + shared visual pane */}
      <div className="hidden lg:grid lg:grid-cols-2 border border-border">
        <div className="flex flex-col">
          {ordered.map((category, i) => {
            const meta = META[category.slug];
            const isActive = i === active;
            return (
              <Link
                key={category.slug}
                href={`/products?category=${category.slug}`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className={`group border-b border-border px-10 py-9 transition-colors duration-500 last:border-none ${
                  isActive ? "bg-background-deep" : ""
                }`}
              >
                <p className="text-[10px] uppercase tracking-[0.28em] text-muted">
                  {meta?.index} — {meta?.descriptor}
                </p>
                <h3
                  className={`mt-2 font-display text-3xl xl:text-4xl transition-colors duration-500 ${
                    isActive ? "text-accent" : "text-foreground"
                  }`}
                >
                  {category.name}
                </h3>
              </Link>
            );
          })}
        </div>

        <div className="relative border-l border-border bg-surface" aria-hidden="true">
          {ordered.map((category, i) => {
            const meta = META[category.slug];
            if (!meta) return null;
            return (
              <Image
                key={category.slug}
                src={meta.icon}
                alt=""
                width={260}
                height={260}
                className={`absolute inset-0 m-auto h-56 w-56 transition-opacity duration-700 ease-[var(--ease-luxury)] ${
                  i === active ? "opacity-100" : "opacity-0"
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Mobile / tablet: each chapter is fully self-contained — no hover dependency */}
      <div className="grid grid-cols-2 gap-px bg-border lg:hidden">
        {ordered.map((category) => {
          const meta = META[category.slug];
          return (
            <Link
              key={category.slug}
              href={`/products?category=${category.slug}`}
              className="group relative aspect-square overflow-hidden bg-background p-6 sm:p-8"
            >
              {meta && (
                <Image
                  src={meta.icon}
                  alt=""
                  width={140}
                  height={140}
                  className="absolute -bottom-6 -right-6 h-32 w-32 opacity-[0.14] transition-transform duration-[1200ms] ease-[var(--ease-luxury)] group-hover:scale-105"
                />
              )}
              <div className="relative flex h-full flex-col justify-end">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted">{meta?.descriptor}</p>
                <h3 className="mt-1.5 font-display text-xl sm:text-2xl">{category.name}</h3>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
