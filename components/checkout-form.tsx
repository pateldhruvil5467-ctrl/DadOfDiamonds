"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCartStore } from "@/lib/cart-store";
import { formatMoney } from "@/lib/format-money";
import { addressSchema, type AddressInput } from "@/lib/validations/address";
import type { CheckoutApiResponse } from "@/lib/validations/checkout";

type SubmitOutcome =
  | { kind: "idle" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string; details?: string[] }
  | { kind: "needs-auth" };

export function CheckoutForm() {
  const router = useRouter();
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const getOrCreateIdempotencyKey = useCartStore((s) => s.getOrCreateIdempotencyKey);
  const clearCart = useCartStore((s) => s.clearCart);
  const clearIdempotencyKey = useCartStore((s) => s.clearIdempotencyKey);

  const [outcome, setOutcome] = useState<SubmitOutcome>({ kind: "idle" });
  // Belt-and-braces double-submit guard: react-hook-form's isSubmitting already disables the
  // button, but this ref blocks re-entrancy synchronously, before React re-renders.
  const isSubmittingRef = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
  });

  if (!hasHydrated) {
    return <div aria-hidden="true" className="mt-10" />;
  }

  if (items.length === 0) {
    return (
      <div className="mt-10 text-center py-16">
        <p className="text-muted">Your cart is empty — add something before checking out.</p>
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

  async function onSubmit(address: AddressInput) {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setOutcome({ kind: "idle" });

    try {
      const idempotencyKey = getOrCreateIdempotencyKey();
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey,
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
          newAddress: address,
        }),
      });

      const data = (await response.json()) as CheckoutApiResponse;

      if (response.status === 401) {
        setOutcome({ kind: "needs-auth" });
        return;
      }

      if (!response.ok || data.status === "error") {
        const details = data.status === "error" ? data.issues?.map((i) => i.message) : undefined;
        setOutcome({
          kind: "error",
          message:
            data.status === "error" && data.error === "invalid_cart"
              ? "Some items in your cart are no longer available as requested."
              : "We couldn't process your order. Please review the details below and try again.",
          details,
        });
        return;
      }

      const { order } = data;
      if (order.paymentStatus === "PAID") {
        // Genuine success — clear the cart (and its idempotency key) only now.
        clearCart();
        router.push(`/orders/${order.orderNumber}`);
        return;
      }

      // A real Order row now exists, but payment did not succeed. Do NOT clear the cart —
      // the customer's items should still be there to retry. The used idempotency key is
      // permanently tied to this failed order, so clear it alone to allow a fresh attempt.
      clearIdempotencyKey();
      setOutcome({
        kind: "error",
        message: `Your order ${order.orderNumber} was created, but payment could not be completed. Please try again.`,
      });
    } catch {
      setOutcome({
        kind: "error",
        message: "Something went wrong submitting your order. Please check your connection and try again.",
      });
    } finally {
      isSubmittingRef.current = false;
    }
  }

  return (
    <div className="mt-10 grid gap-12 sm:grid-cols-2">
      <section aria-labelledby="order-summary-heading">
        <h2 id="order-summary-heading" className="text-sm uppercase tracking-widest text-muted">
          Order Summary
        </h2>
        <ul className="mt-4 flex flex-col gap-4">
          {items.map((item) => (
            <li key={item.productId} className="flex justify-between gap-4 text-sm border-b border-border pb-4">
              <span>
                {item.name} <span className="text-muted">× {item.quantity}</span>
              </span>
              <span className="whitespace-nowrap">{formatMoney(item.price * item.quantity, item.currency)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex justify-between text-sm">
          <span>Subtotal</span>
          <span>{formatMoney(subtotal, currency)}</span>
        </div>
        <p className="mt-2 text-xs text-muted">
          This subtotal is an estimate for your review. Shipping, tax, and the final order total
          are calculated and confirmed by the server — the amount above is not authoritative.
        </p>

        <Link href="/cart" className="mt-6 inline-block text-sm text-muted hover:text-accent transition-colors">
          ← Edit cart
        </Link>
      </section>

      <section aria-labelledby="shipping-heading">
        <h2 id="shipping-heading" className="text-sm uppercase tracking-widest text-muted">
          Shipping Details
        </h2>

        <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Field label="Full name" error={errors.fullName?.message}>
            <input {...register("fullName")} autoComplete="name" className={inputClass} />
          </Field>

          <Field label="Address line 1" error={errors.line1?.message}>
            <input {...register("line1")} autoComplete="address-line1" className={inputClass} />
          </Field>

          <Field label="Address line 2 (optional)" error={errors.line2?.message}>
            <input {...register("line2")} autoComplete="address-line2" className={inputClass} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="City" error={errors.city?.message}>
              <input {...register("city")} autoComplete="address-level2" className={inputClass} />
            </Field>
            <Field label="State / Province" error={errors.state?.message}>
              <input {...register("state")} autoComplete="address-level1" className={inputClass} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Postal code" error={errors.postalCode?.message}>
              <input {...register("postalCode")} autoComplete="postal-code" className={inputClass} />
            </Field>
            <Field label="Country" error={errors.country?.message}>
              <input {...register("country")} autoComplete="country-name" className={inputClass} />
            </Field>
          </div>

          <Field label="Phone" error={errors.phone?.message}>
            <input {...register("phone")} type="tel" autoComplete="tel" className={inputClass} />
          </Field>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 bg-foreground text-background px-8 py-3 text-sm tracking-widest uppercase hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Placing Order…" : "Place Order"}
          </button>

          <div aria-live="polite">
            {outcome.kind === "success" && (
              <p className="text-sm text-accent" role="status">
                {outcome.message}
              </p>
            )}
            {outcome.kind === "needs-auth" && (
              <div className="text-sm text-red-700" role="alert">
                <p>
                  Please{" "}
                  <Link href="/login?callbackUrl=%2Fcheckout" className="underline">
                    sign in
                  </Link>{" "}
                  to complete your order. Your cart will still be here.
                </p>
              </div>
            )}
            {outcome.kind === "error" && (
              <div className="text-sm text-red-700" role="alert">
                <p>{outcome.message}</p>
                {outcome.details && outcome.details.length > 0 && (
                  <ul className="mt-2 list-disc pl-5">
                    {outcome.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}

const inputClass =
  "w-full border border-border bg-background px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span>{label}</span>
      {children}
      {error && (
        <span className="text-xs text-red-700" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}
