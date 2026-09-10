import { OrderStatus, PaymentStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { paymentProvider } from "@/lib/payments";

/**
 * Settles payment for an order in three phases. Only the middle phase touches the network,
 * and only the first phase (a single atomic DB write) decides whether that network call ever
 * happens — this is what prevents a duplicate real charge under concurrent/retried calls, not
 * just the phase-3 guard (which exists purely as defense in depth).
 *
 * Repeated calls for an order that has already been claimed/settled short-circuit at phase 1
 * and return the current order state without calling the provider again, without creating a
 * second paymentReference, and without restocking a second time.
 */
export async function settlePayment(orderId: string) {
  // Phase 1: claim (atomic, DB-only) — before calling any provider.
  const claim = await prisma.order.updateMany({
    where: { id: orderId, paymentStatus: PaymentStatus.PENDING, paymentAttemptedAt: null },
    data: { paymentAttemptedAt: new Date() },
  });

  if (claim.count === 0) {
    // Never eligible, already settled, or another call already claimed it. Do not call the
    // provider — just return the order's current state.
    return prisma.order.findUniqueOrThrow({
      where: { id: orderId },
      include: { items: true },
    });
  }

  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { items: true },
  });

  // Phase 2: call the provider — strictly outside any Prisma transaction. Only the caller
  // that won the phase-1 claim reaches this line, so this executes at most once per order.
  const result = await paymentProvider.charge({
    orderId: order.id,
    amount: order.total,
    currency: order.currency,
    idempotencyKey: order.id,
  });

  // Phase 3: finalize (atomic, DB-only, its own short transaction). The conditional
  // `paymentStatus: PENDING` guard here is a second, independent safety net on top of the
  // phase-1 claim.
  return prisma.$transaction(async (tx) => {
    if (result.success) {
      await tx.order.updateMany({
        where: { id: orderId, paymentStatus: PaymentStatus.PENDING },
        data: {
          paymentStatus: PaymentStatus.PAID,
          status: OrderStatus.CONFIRMED,
          paymentReference: result.reference,
        },
      });
    } else {
      const finalized = await tx.order.updateMany({
        where: { id: orderId, paymentStatus: PaymentStatus.PENDING },
        data: {
          paymentStatus: PaymentStatus.FAILED,
          status: OrderStatus.CANCELLED,
        },
      });

      // Restock only when this call actually performed the transition (count === 1) — so
      // it can run at most once per order, even if this branch were ever reached twice.
      if (finalized.count === 1) {
        for (const item of order.items) {
          if (item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
      }
    }

    return tx.order.findUniqueOrThrow({
      where: { id: orderId },
      include: { items: true },
    });
  });
}
