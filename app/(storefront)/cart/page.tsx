"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { QuantityStepper } from "@/components/quantity-stepper";
import { LuxuryButton } from "@/components/luxury-button";
import { formatMoney } from "@/lib/format-money";

export default function CartPage() {
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const increaseQuantity = useCartStore((s) => s.increaseQuantity);
  const decreaseQuantity = useCartStore((s) => s.decreaseQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);

  if (!hasHydrated) {
    // Avoids a hydration mismatch: server-rendered HTML has no localStorage to read from, so
    // we render nothing cart-dependent until the client store has finished rehydrating.
    return <div className="pt-[110px] pb-24" aria-hidden="true" />;
  }

  if (items.length === 0) {
    return (
      <div className="pt-[110px]">
        <div className="mx-auto max-w-4xl px-6 pb-24 text-center">
          <p className="eyebrow">Your Bag</p>
          <h1 className="mt-4 font-display text-4xl">Your cart is empty</h1>
          <p className="mt-4 text-muted">Browse the collection and find something for anyone.</p>
          <div className="mt-9">
            <LuxuryButton href="/products" variant="solid" arrow>
              Shop the Collection
            </LuxuryButton>
          </div>
        </div>
      </div>
    );
  }

  const currency = items[0]?.currency ?? "EUR";

  return (
    <div className="pt-[110px]">
      <div className="mx-auto max-w-4xl px-6 pb-24">
        <p className="eyebrow">Your Bag</p>
        <h1 className="mt-4 font-display text-4xl">Your Cart</h1>

        <ul className="mt-12 flex flex-col">
          {items.map((item) => (
            <li key={item.productId} className="flex gap-7 border-b border-border py-8 first:pt-0">
              <div className="relative h-32 w-32 sm:h-40 sm:w-40 shrink-0 bg-surface flex items-center justify-center overflow-hidden">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={160}
                    height={160}
                    className="h-full w-full object-contain p-6"
                  />
                ) : (
                  <span className="text-xs text-muted">No image</span>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between min-w-0">
                <div className="flex justify-between gap-4">
                  <div className="min-w-0">
                    <Link href={`/products/${item.slug}`} className="link-reveal text-sm hover:text-foreground transition-colors">
                      {item.name}
                    </Link>
                    <p className="mt-1.5 text-sm text-muted">{formatMoney(item.price, item.currency)} each</p>
                  </div>
                  <p className="text-sm whitespace-nowrap text-champagne">{formatMoney(item.price * item.quantity, item.currency)}</p>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <QuantityStepper
                    label={`Quantity for ${item.name}`}
                    value={item.quantity}
                    max={item.stock}
                    onDecrease={() => decreaseQuantity(item.productId)}
                    onIncrease={() => increaseQuantity(item.productId)}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    aria-label={`Remove ${item.name} from cart`}
                    className="link-reveal text-xs uppercase tracking-[0.15em] text-muted hover:text-foreground transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <button
            type="button"
            onClick={clearCart}
            className="link-reveal self-start text-xs uppercase tracking-[0.15em] text-muted hover:text-foreground transition-colors"
          >
            Clear Cart
          </button>

          <div className="w-full sm:w-72">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span>{formatMoney(subtotal, currency)}</span>
            </div>
            <p className="mt-2 text-xs text-muted">Shipping and taxes calculated at checkout.</p>

            <div className="mt-7">
              <LuxuryButton href="/checkout" variant="solid" arrow className="w-full">
                Checkout
              </LuxuryButton>
            </div>
            <Link
              href="/products"
              className="mt-5 block text-center text-xs uppercase tracking-[0.15em] text-muted hover:text-foreground transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
