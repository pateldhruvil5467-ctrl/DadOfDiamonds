"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { QuantityStepper } from "@/components/quantity-stepper";
import { LuxuryButton } from "@/components/luxury-button";

type AddToCartFormProps = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  image?: string;
  stock: number;
};

export function AddToCartForm({ productId, slug, name, price, currency, image, stock }: AddToCartFormProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [confirmation, setConfirmation] = useState(false);

  if (stock <= 0) {
    return (
      <p className="text-sm text-muted" role="status">
        Out of stock — check back soon.
      </p>
    );
  }

  function handleAddToCart() {
    addItem({ productId, slug, name, price, currency, image, stock }, quantity);
    setConfirmation(true);
    setTimeout(() => setConfirmation(false), 2000);
  }

  return (
    <div className="flex flex-col gap-5">
      <QuantityStepper
        label={`Quantity for ${name}`}
        value={quantity}
        max={stock}
        onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
        onIncrease={() => setQuantity((q) => Math.min(stock, q + 1))}
      />

      <LuxuryButton type="button" variant="solid" onClick={handleAddToCart} arrow className="w-fit">
        Add to Bag
      </LuxuryButton>

      <p aria-live="polite" className="text-xs uppercase tracking-[0.15em] text-accent min-h-4">
        {confirmation ? `Added to bag` : ""}
      </p>
    </div>
  );
}
