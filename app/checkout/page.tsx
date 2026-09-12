import { CheckoutForm } from "@/components/checkout-form";

export default function CheckoutPage() {
  return (
    <div className="pt-[110px]">
      <div className="mx-auto max-w-4xl px-6 pb-24">
        <p className="eyebrow">Almost There</p>
        <h1 className="mt-4 font-display text-4xl">Checkout</h1>
        <CheckoutForm />
      </div>
    </div>
  );
}
