import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/generated/prisma/client";

const CATEGORY_META: Record<string, { icon: string; descriptor: string }> = {
  rings: { icon: "/categories/ring.svg", descriptor: "Symbols of forever" },
  earrings: { icon: "/categories/earring.svg", descriptor: "Effortless brilliance" },
  "chains-necklaces": { icon: "/categories/necklace.svg", descriptor: "Statement pieces" },
  bracelets: { icon: "/categories/bracelet.svg", descriptor: "Everyday luxury" },
};

export function CategoryCard({
  category,
  size = "small",
}: {
  category: Category;
  size?: "large" | "small";
}) {
  const meta = CATEGORY_META[category.slug];

  return (
    <Link
      href={`/products?category=${category.slug}`}
      className={`group relative block overflow-hidden border border-border bg-surface shimmer-sweep transition-colors duration-500 hover:border-accent ${
        size === "large" ? "aspect-[4/3] sm:aspect-[16/10]" : "aspect-[4/5]"
      }`}
    >
      {/* Oversized faint icon as background motif */}
      {meta && (
        <Image
          src={meta.icon}
          alt=""
          width={320}
          height={320}
          className="absolute -bottom-10 -right-10 h-56 w-56 opacity-[0.08] transition-transform duration-700 ease-[var(--ease-luxury)] group-hover:scale-110"
        />
      )}

      <div className="relative flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        {meta && (
          <Image
            src={meta.icon}
            alt=""
            width={96}
            height={96}
            className="h-16 w-16 sm:h-20 sm:w-20 transition-transform duration-500 ease-[var(--ease-luxury)] group-hover:-translate-y-1"
          />
        )}
        <div>
          <h3 className="font-display text-2xl sm:text-3xl">{category.name}</h3>
          {meta && <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted">{meta.descriptor}</p>}
        </div>
        <span className="mt-2 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          Explore
          <svg viewBox="0 0 16 10" width="16" height="10" aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
            <path d="M0 5h14M9 1l4.5 4L9 9" fill="none" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-px bg-accent scale-x-0 origin-left transition-transform duration-500 ease-[var(--ease-luxury)] group-hover:scale-x-100" />
    </Link>
  );
}
