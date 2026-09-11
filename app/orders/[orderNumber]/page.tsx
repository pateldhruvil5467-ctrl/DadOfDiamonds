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
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
      <div className="text-center">
        {isPaid && <DiamondSparkle size={28} className="mx-auto mb-5" />}
        <p className="eyebrow">{isPaid ? "Order Confirmed" : "Order Received"}</p>
        <h1 className="mt-4 font-display text-4xl sm:text-5xl">
          {isPaid ? (
            <>
              Thank you for choosing
              <br />
              <span className="text-accent">Dad of Diamonds.</span>
            </>
          ) : (
            "We received your order"
          )}
        </h1>
        <p className="mt-4 text-muted">Order {order.orderNumber}</p>
      </div>

      <div className="mt-10 flex justify-center gap-6 text-sm">
        <StatusPill label="Status" value={order.status} positive={isPaid} />
        <StatusPill label="Payment" value={order.paymentStatus} positive={isPaid} />
      </div>

      <section aria-labelledby="items-heading" className="mt-14 border-t border-border pt-10">
        <h2 id="items-heading" className="eyebrow">
          Items
        </h2>
        <ul className="mt-5 flex flex-col gap-4">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4 text-sm border-b border-border pb-4">
              <span>
                {item.productName} <span className="text-muted">× {item.quantity}</span>
              </span>
              <span className="whitespace-nowrap">{formatMoney(item.subtotal, order.currency)}</span>
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
        <div className="mt-3 flex justify-between text-lg font-display">
          <span>Total</span>
          <span className="text-accent">{formatMoney(order.total, order.currency)}</span>
        </div>
      </section>

      <section aria-labelledby="shipping-heading" className="mt-10 border-t border-border pt-10">
        <h2 id="shipping-heading" className="eyebrow">
          Shipping To
        </h2>
        <address className="mt-5 not-italic text-sm leading-relaxed text-muted">
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

      <div className="mt-14 text-center">
        <LuxuryButton href="/products" arrow>
          Continue Shopping
        </LuxuryButton>
      </div>
    </div>
  );
}

function StatusPill({ label, value, positive }: { label: string; value: string; positive: boolean }) {
  return (
    <div className={`border px-4 py-2 ${positive ? "border-accent text-accent" : "border-border text-muted"}`}>
      <span className="text-[10px] uppercase tracking-[0.2em]">{label}: </span>
      <span className="text-xs uppercase tracking-[0.15em]">{value}</span>
    </div>
  );
}
