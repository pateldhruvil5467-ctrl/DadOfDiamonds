import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/generated/prisma/client";

const CATEGORY_ICONS: Record<string, string> = {
  rings: "/categories/ring.svg",
  earrings: "/categories/earring.svg",
  "chains-necklaces": "/categories/necklace.svg",
  bracelets: "/categories/bracelet.svg",
};

export function CategoryCard({ category }: { category: Category }) {
  const icon = CATEGORY_ICONS[category.slug];

  return (
    <Link href={`/products?category=${category.slug}`} className="group block text-center">
      <div className="aspect-square bg-surface border border-border flex items-center justify-center">
        {icon && (
          <Image
            src={icon}
            alt=""
            width={96}
            height={96}
            className="h-24 w-24 transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </div>
      <h3 className="mt-4 text-sm tracking-wide">{category.name}</h3>
    </Link>
  );
}
