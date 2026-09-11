import { CheckoutForm } from "@/components/checkout-form";

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
      <p className="eyebrow">Almost There</p>
      <h1 className="mt-3 font-display text-4xl">Checkout</h1>
      <CheckoutForm />
    </div>
  );
}
