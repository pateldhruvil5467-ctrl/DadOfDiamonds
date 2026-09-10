"use client";

import { useCartStore } from "@/lib/cart-store";

/**
 * The only client-rendered piece of the header — everything else stays a Server Component.
 * Purely decorative (aria-hidden): the cart link's own accessible name already says "Your
 * cart"; the numeric badge is a visual reinforcement, not the only way to know cart contents.
 */
export function CartBadge() {
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const items = useCartStore((s) => s.items);

  if (!hasHydrated) return null;
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  if (count === 0) return null;

  return (
    <span
      aria-hidden="true"
      className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] leading-none text-accent-foreground"
    >
      {count}
    </span>
  );
}
