import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatMoney } from "@/lib/format-money";
import { DiamondSparkle } from "@/components/diamond-sparkle";
import { LuxuryButton } from "@/components/luxury-button";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  // Same underlying auth() primitive lib/auth-guards.ts's requireUserId() wraps — used
  // directly here (rather than requireUserId, which throws) so an unauthenticated visitor
  // gets a proper redirect to /login instead of a thrown-error crash page.
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/orders/${orderNumber}`)}`);
  }
  const userId = session.user.id;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });

  // Ownership check: never let one customer view another's order by guessing/changing the URL.
  // A non-existent order and someone else's order return the exact same notFound() response,
  // so the two cases are indistinguishable from the outside.
  if (!order || order.userId !== userId) {
    notFound();
  }

  const isPaid = order.paymentStatus === "PAID";

  return (
    <div className="pt-[140px]">
      <div className="mx-auto max-w-2xl px-6 pb-24">
        <div className="text-center">
          {isPaid && <DiamondSparkle size={26} className="mx-auto mb-7" />}
          <p className="eyebrow">{isPaid ? "Order Confirmed" : "Order Received"}</p>
          <h1 className="mt-5 font-display text-4xl sm:text-5xl leading-[1.1]">
            {isPaid ? (
              <>
                Thank you for choosing
                <br />
                Dad of Diamonds.
              </>
            ) : (
              "We received your order"
            )}
          </h1>
          <p className="mt-5 text-sm text-muted">Order {order.orderNumber}</p>
        </div>

        <div className="mt-9 flex justify-center gap-8 text-xs uppercase tracking-[0.2em]">
          <span className={isPaid ? "text-accent" : "text-muted"}>Status — {order.status}</span>
          <span className={isPaid ? "text-accent" : "text-muted"}>Payment — {order.paymentStatus}</span>
        </div>

        <section aria-labelledby="items-heading" className="mt-16 border-t border-border pt-10">
          <h2 id="items-heading" className="eyebrow">
            Items
          </h2>
          <ul className="mt-6 flex flex-col">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 text-sm border-b border-border py-4 first:pt-0">
                <span>
                  {item.productName} <span className="text-muted">× {item.quantity}</span>
                </span>
                <span className="whitespace-nowrap text-champagne">{formatMoney(item.subtotal, order.currency)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex justify-between text-sm text-muted">
            <span>Subtotal</span>
            <span>{formatMoney(order.subtotal, order.currency)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted">
            <span>Shipping</span>
            <span>{formatMoney(order.shippingCost, order.currency)}</span>
          </div>
          <div className="mt-4 flex justify-between font-display text-xl">
            <span>Total</span>
            <span>{formatMoney(order.total, order.currency)}</span>
          </div>
        </section>

        <section aria-labelledby="shipping-heading" className="mt-12 border-t border-border pt-10">
          <h2 id="shipping-heading" className="eyebrow">
            Shipping To
          </h2>
          <address className="mt-6 not-italic text-sm leading-relaxed text-muted">
            <span className="text-foreground">{order.shippingFullName}</span>
            <br />
            {order.shippingLine1}
            <br />
            {order.shippingLine2 && (
              <>
                {order.shippingLine2}
                <br />
              </>
            )}
            {order.shippingCity}, {order.shippingState} {order.shippingPostalCode}
            <br />
            {order.shippingCountry}
            <br />
            {order.shippingPhone}
          </address>
        </section>

        <div className="mt-16 text-center">
          <LuxuryButton href="/products" variant="outline" arrow>
            Continue Shopping
          </LuxuryButton>
        </div>
      </div>
    </div>
  );
}
