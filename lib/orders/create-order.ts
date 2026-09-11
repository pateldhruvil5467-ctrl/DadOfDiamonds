import { Prisma, OrderStatus, PaymentStatus, PaymentProviderName } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { AddressInput } from "@/lib/validations/address";

export class ProductUnavailableError extends Error {
  constructor(public productId: string) {
    super(`Product ${productId} not found or unavailable.`);
  }
}

export class InsufficientStockError extends Error {
  constructor(
    public productId: string,
    public productName: string,
    public available: number,
  ) {
    super(`Only ${available} of "${productName}" available.`);
  }
}

export class AddressNotFoundError extends Error {
  constructor() {
    super("Selected address not found.");
  }
}

/** Thrown when the submitted idempotencyKey already belongs to a DIFFERENT user's order — never
 * silently return one user's order to another. */
export class IdempotencyKeyOwnershipError extends Error {
  constructor() {
    super("This idempotency key is already associated with a different account.");
  }
}

interface CreateOrderInput {
  userId: string;
  idempotencyKey: string;
  items: { productId: string; quantity: number }[];
  addressId?: string;
  newAddress?: AddressInput;
}

function isIdempotencyKeyUniqueViolation(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
    return false;
  }
  // Prisma 7 + driver adapters nest the real Postgres error under meta.driverAdapterError
  // rather than a flat `target` array — match on the constraint name directly.
  return JSON.stringify(error.meta ?? {}).includes("Order_idempotencyKey_key");
}

/**
 * Gets the existing order for this idempotency key, or creates one transactionally. This is the
 * ONLY place Orders are created. Never calls the payment provider — that happens strictly after
 * this function's transaction has committed (see app/api/checkout/route.ts).
 *
 * Concurrency/idempotency: a duplicate submission (same key) is handled two ways —
 *  1. A fast pre-transaction read returns the existing order immediately, if one already exists.
 *  2. If two requests race past that read simultaneously, both enter a transaction, but only one
 *     can successfully INSERT a row with that idempotencyKey — Postgres's unique constraint is
 *     the actual, race-proof guarantee. The loser's transaction fails with P2002 and rolls back
 *     entirely (including its stock decrements), then we re-read and return the winner's order.
 */
export async function getOrCreateOrder(input: CreateOrderInput) {
  const existing = await prisma.order.findUnique({
    where: { idempotencyKey: input.idempotencyKey },
    include: { items: true },
  });
  if (existing) {
    if (existing.userId !== input.userId) throw new IdempotencyKeyOwnershipError();
    return existing;
  }

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Resolve shipping address (ownership-checked if reusing a saved one) before touching
      //    inventory, so an invalid address fails fast without any stock side effects.
      let resolvedAddressId: string | null = null;
      let shipping: {
        fullName: string;
        line1: string;
        line2?: string | null;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        phone: string;
      };

      if (input.addressId) {
        const address = await tx.address.findFirst({
          where: { id: input.addressId, userId: input.userId },
        });
        if (!address) throw new AddressNotFoundError();
        resolvedAddressId = address.id;
        shipping = address;
      } else if (input.newAddress) {
        const created = await tx.address.create({
          data: { userId: input.userId, ...input.newAddress },
        });
        resolvedAddressId = created.id;
        shipping = created;
      } else {
        // Unreachable in practice — checkoutSchema's refine already guarantees exactly one of
        // addressId/newAddress is present before this function is ever called.
        throw new AddressNotFoundError();
      }

      // 2. Authoritative product read — never trust client-supplied price/name/stock.
      const productIds = input.items.map((item) => item.productId);
      const products = await tx.product.findMany({ where: { id: { in: productIds } } });
      const productById = new Map(products.map((p) => [p.id, p]));

      // 3. Validate + atomically decrement stock, one line at a time. The conditional
      //    updateMany (not a read-then-write) is what actually prevents overselling under
      //    concurrent checkouts for different orders touching the same product.
      let subtotal = new Prisma.Decimal(0);
      const orderItemsData: Prisma.OrderItemCreateWithoutOrderInput[] = [];

      for (const line of input.items) {
        const product = productById.get(line.productId);
        if (!product || !product.isActive) throw new ProductUnavailableError(line.productId);

        const decremented = await tx.product.updateMany({
          where: { id: product.id, isActive: true, stock: { gte: line.quantity } },
          data: { stock: { decrement: line.quantity } },
        });
        if (decremented.count !== 1) {
          throw new InsufficientStockError(product.id, product.name, product.stock);
        }

        const lineSubtotal = product.price.mul(line.quantity);
        subtotal = subtotal.add(lineSubtotal);
        orderItemsData.push({
          product: { connect: { id: product.id } },
          productName: product.name,
          sku: product.sku,
          unitPrice: product.price,
          quantity: line.quantity,
          subtotal: lineSubtotal,
        });
      }

      const shippingCost = new Prisma.Decimal(0);
      const total = subtotal.add(shippingCost);
      const currency = products[0]?.currency ?? "EUR";

      // 4. Create the order. orderNumber starts null — it can only be derived from orderSeq,
      //    which Postgres only assigns once the row is inserted (see schema comment on
      //    Order.orderNumber). Both steps happen in this one transaction, so no committed row
      //    can ever be left with orderNumber = null.
      const order = await tx.order.create({
        data: {
          idempotencyKey: input.idempotencyKey,
          userId: input.userId,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          paymentProvider: PaymentProviderName.MOCK,
          currency,
          subtotal,
          shippingCost,
          total,
          addressId: resolvedAddressId,
          shippingFullName: shipping.fullName,
          shippingLine1: shipping.line1,
          shippingLine2: shipping.line2 || null,
          shippingCity: shipping.city,
          shippingState: shipping.state,
          shippingPostalCode: shipping.postalCode,
          shippingCountry: shipping.country,
          shippingPhone: shipping.phone,
          items: { create: orderItemsData },
        },
      });

      const orderNumber = `DOD-${new Date().getFullYear()}-${String(order.orderSeq).padStart(6, "0")}`;
      const updated = await tx.order.update({
        where: { id: order.id },
        data: { orderNumber },
        include: { items: true },
      });

      if (!updated.orderNumber) {
        throw new Error("orderNumber was not set — aborting transaction.");
      }
      return updated;
    });
  } catch (error) {
    if (isIdempotencyKeyUniqueViolation(error)) {
      const winner = await prisma.order.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
        include: { items: true },
      });
      if (winner) {
        if (winner.userId !== input.userId) throw new IdempotencyKeyOwnershipError();
        return winner;
      }
    }
    throw error;
  }
}
