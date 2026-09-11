import { NextResponse } from "next/server";
import { requireUserId, UnauthorizedError } from "@/lib/auth-guards";
import { checkoutSchema, type CheckoutApiResponse } from "@/lib/validations/checkout";
import {
  getOrCreateOrder,
  ProductUnavailableError,
  InsufficientStockError,
  AddressNotFoundError,
  IdempotencyKeyOwnershipError,
} from "@/lib/orders/create-order";
import { settlePayment } from "@/lib/payments/settle-payment";

/**
 * Phase 2.3B: the real transactional checkout.
 *
 * Flow (matches the approved Phase 1 architecture):
 *   1. Authenticate (server session only — never trust a client-supplied user id).
 *   2. Validate the request body against the existing checkoutSchema.
 *   3. getOrCreateOrder(): ONE Prisma transaction that re-validates products, atomically
 *      decrements stock, and creates the Order + OrderItem snapshot rows. This transaction
 *      never calls the payment provider.
 *   4. Only after that transaction has committed: settlePayment(order.id) — a separate,
 *      idempotent function that calls the mock provider and finalizes paymentStatus.
 *   5. Respond with the real order state (never a fabricated success).
 */
export async function POST(request: Request) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return json({ status: "error", error: "unauthorized" }, 401);
    }
    throw error;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ status: "error", error: "invalid_json" }, 400);
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      {
        status: "error",
        error: "validation_error",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      400,
    );
  }

  const { items, idempotencyKey, addressId, newAddress } = parsed.data;

  let order;
  try {
    order = await getOrCreateOrder({ userId, idempotencyKey, items, addressId, newAddress });
  } catch (error) {
    if (error instanceof ProductUnavailableError) {
      return json(
        { status: "error", error: "invalid_cart", issues: [{ path: "items", message: error.message }] },
        400,
      );
    }
    if (error instanceof InsufficientStockError) {
      return json(
        { status: "error", error: "invalid_cart", issues: [{ path: "items", message: error.message }] },
        400,
      );
    }
    if (error instanceof AddressNotFoundError) {
      return json(
        { status: "error", error: "invalid_address", issues: [{ path: "addressId", message: error.message }] },
        400,
      );
    }
    if (error instanceof IdempotencyKeyOwnershipError) {
      return json({ status: "error", error: "idempotency_conflict" }, 409);
    }
    console.error("Checkout order creation failed:", error);
    return json({ status: "error", error: "server_error" }, 500);
  }

  // Payment settlement happens strictly after the order transaction has committed — never
  // inside it. settlePayment() is itself idempotent (safe to call again for an
  // already-settled order), so this is safe even when order came from the idempotency fast path.
  const settled = await settlePayment(order.id);

  return json(
    {
      status: "order_created",
      order: {
        orderNumber: settled.orderNumber!,
        status: settled.status,
        paymentStatus: settled.paymentStatus,
        total: settled.total.toString(),
        currency: settled.currency,
      },
    },
    200,
  );
}

function json(body: CheckoutApiResponse, status: number) {
  return NextResponse.json(body, { status });
}
