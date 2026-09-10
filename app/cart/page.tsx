"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { QuantityStepper } from "@/components/quantity-stepper";
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
    return <div className="mx-auto max-w-4xl px-6 py-16" aria-hidden="true" />;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl">Your cart is empty</h1>
        <p className="mt-4 text-muted">Browse the collection and find something for anyone.</p>
        <Link
          href="/products"
          className="mt-8 inline-block bg-foreground text-background px-8 py-3 text-sm tracking-widest uppercase hover:bg-accent transition-colors"
        >
          Shop the Collection
        </Link>
      </div>
    );
  }

  const currency = items[0]?.currency ?? "EUR";

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-3xl">Your Cart</h1>

      <ul className="mt-10 flex flex-col gap-8">
        {items.map((item) => (
          <li key={item.productId} className="flex gap-6 border-b border-border pb-8">
            <div className="h-28 w-28 shrink-0 bg-surface border border-border flex items-center justify-center">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  width={112}
                  height={112}
                  className="h-full w-full object-contain p-4"
                />
              ) : (
                <span className="text-xs text-muted">No image</span>
              )}
            </div>

            <div className="flex flex-1 flex-col justify-between min-w-0">
              <div className="flex justify-between gap-4">
                <div className="min-w-0">
                  <Link href={`/products/${item.slug}`} className="text-sm hover:text-accent transition-colors">
                    {item.name}
                  </Link>
                  <p className="mt-1 text-sm text-muted">{formatMoney(item.price, item.currency)} each</p>
                </div>
                <p className="text-sm whitespace-nowrap">{formatMoney(item.price * item.quantity, item.currency)}</p>
              </div>

              <div className="mt-4 flex items-center justify-between">
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
                  className="text-sm text-muted hover:text-accent transition-colors underline underline-offset-4"
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <button
          type="button"
          onClick={clearCart}
          className="text-sm text-muted hover:text-accent transition-colors underline underline-offset-4 self-start"
        >
          Clear cart
        </button>

        <div className="w-full sm:w-72 sm:text-right">
          <div className="flex justify-between text-sm text-muted">
            <span>Subtotal</span>
            <span>{formatMoney(subtotal, currency)}</span>
          </div>
          <p className="mt-1 text-xs text-muted">Shipping and taxes calculated at checkout.</p>

          <Link
            href="/checkout"
            className="mt-6 block bg-foreground text-background px-8 py-3 text-center text-sm tracking-widest uppercase hover:bg-accent transition-colors"
          >
            Checkout
          </Link>
          <Link
            href="/products"
            className="mt-4 block text-center text-sm text-muted hover:text-accent transition-colors"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
