import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/generated/prisma/client";

const META: Record<string, { icon: string; descriptor: string }> = {
  rings: { icon: "/categories/ring.svg", descriptor: "Symbols of forever" },
  earrings: { icon: "/categories/earring.svg", descriptor: "Effortless brilliance" },
  "chains-necklaces": { icon: "/categories/necklace.svg", descriptor: "Statement pieces" },
  bracelets: { icon: "/categories/bracelet.svg", descriptor: "Everyday luxury" },
};

// A fixed editorial arrangement — Rings and Bracelets anchor the composition as large panels,
// Earrings and Necklaces sit as a smaller pair between them. Deliberately NOT four identical
// cards in a grid.
const ORDER = ["rings", "earrings", "chains-necklaces", "bracelets"];

export function CollectionsPanel({ categories }: { categories: Category[] }) {
  const bySlug = new Map(categories.map((c) => [c.slug, c]));
  const ordered = ORDER.map((slug) => bySlug.get(slug)).filter((c): c is Category => Boolean(c));
  const [rings, earrings, necklaces, bracelets] = ordered;

  return (
    <div className="grid grid-cols-2 gap-px bg-border">
      {rings && <Panel category={rings} size="large" />}
      {earrings && <Panel category={earrings} size="small" />}
      {necklaces && <Panel category={necklaces} size="small" />}
      {bracelets && <Panel category={bracelets} size="large" />}
    </div>
  );
}

function Panel({ category, size }: { category: Category; size: "large" | "small" }) {
  const meta = META[category.slug];
  return (
    <Link
      href={`/products?category=${category.slug}`}
      className={`group relative block overflow-hidden bg-background transition-colors duration-700 ${
        size === "large" ? "col-span-2 aspect-[16/9] sm:aspect-[21/9]" : "col-span-1 aspect-square sm:aspect-[4/5]"
      }`}
    >
      {meta && (
        <Image
          src={meta.icon}
          alt=""
          width={size === "large" ? 220 : 140}
          height={size === "large" ? 220 : 140}
          className={`absolute opacity-[0.09] transition-transform duration-[1400ms] ease-[var(--ease-luxury)] group-hover:scale-110 ${
            size === "large" ? "-bottom-8 -right-8 h-56 w-56" : "-bottom-6 -right-6 h-36 w-36"
          }`}
        />
      )}

      <div className={`relative flex h-full flex-col justify-end p-6 sm:p-10 ${size === "large" ? "sm:p-12" : ""}`}>
        <p className="text-[10px] uppercase tracking-[0.24em] text-muted">{meta?.descriptor}</p>
        <h3 className={`mt-2 font-display leading-none ${size === "large" ? "text-4xl sm:text-6xl" : "text-2xl sm:text-3xl"}`}>
          {category.name}
        </h3>
        <span className="mt-4 inline-flex w-fit items-center gap-2 text-[11px] uppercase tracking-[0.2em] opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          Discover
          <svg viewBox="0 0 16 10" width="14" height="9" aria-hidden="true" className="transition-transform duration-500 group-hover:translate-x-1">
            <path d="M0 5h14M9 1l4.5 4L9 9" fill="none" stroke="currentColor" strokeWidth="1" />
          </svg>
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-px bg-accent scale-x-0 origin-left transition-transform duration-700 ease-[var(--ease-luxury)] group-hover:scale-x-100" />
    </Link>
  );
}
