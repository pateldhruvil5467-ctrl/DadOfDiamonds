import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatMoney } from "@/lib/format-money";

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

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl">Order {order.orderNumber}</h1>

      <div className="mt-4 flex gap-6 text-sm text-muted">
        <span>Status: {order.status}</span>
        <span>Payment: {order.paymentStatus}</span>
      </div>

      <section aria-labelledby="items-heading" className="mt-10">
        <h2 id="items-heading" className="text-sm uppercase tracking-widest text-muted">
          Items
        </h2>
        <ul className="mt-4 flex flex-col gap-4">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4 text-sm border-b border-border pb-4">
              <span>
                {item.productName} <span className="text-muted">× {item.quantity}</span>
              </span>
              <span className="whitespace-nowrap">{formatMoney(item.subtotal, order.currency)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex justify-between text-sm">
          <span>Subtotal</span>
          <span>{formatMoney(order.subtotal, order.currency)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Shipping</span>
          <span>{formatMoney(order.shippingCost, order.currency)}</span>
        </div>
        <div className="mt-2 flex justify-between text-base font-medium">
          <span>Total</span>
          <span>{formatMoney(order.total, order.currency)}</span>
        </div>
      </section>

      <section aria-labelledby="shipping-heading" className="mt-10">
        <h2 id="shipping-heading" className="text-sm uppercase tracking-widest text-muted">
          Shipping To
        </h2>
        <address className="mt-4 not-italic text-sm leading-relaxed">
          {order.shippingFullName}
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

      <Link
        href="/products"
        className="mt-10 inline-block bg-foreground text-background px-8 py-3 text-sm tracking-widest uppercase hover:bg-accent transition-colors"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
