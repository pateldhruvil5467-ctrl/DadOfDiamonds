import type { Prisma } from "@/generated/prisma/client";

type Decimal = Prisma.Decimal;

export interface ChargeInput {
  orderId: string;
  amount: Decimal;
  currency: string;
  /**
   * Stable idempotency key for this charge attempt. In this design it is always the order's
   * id (one charge attempt per order) — the interface requires every provider implementation
   * to accept and use it so duplicate-charge protection isn't optional per-provider.
   *
   * Guidance for a real integration (not implemented here — MOCK is the only active provider):
   * - Stripe: pass this value as the native `Idempotency-Key` request header; Stripe
   *   deduplicates server-side for a rolling window.
   * - Razorpay: has no native idempotency header — persist and check Razorpay's
   *   `order_id`/`payment_id` yourself before acting on a webhook.
   * Either way, the webhook handler that eventually calls settlePayment() must also
   * independently dedupe by provider event id — settlePayment()'s own DB-level guard
   * (lib/payments/settle-payment.ts) is the last line of defense, not the only one expected
   * in production.
   */
  idempotencyKey: string;
}

export interface ChargeResult {
  success: boolean;
  reference?: string;
  error?: string;
}

export interface PaymentProvider {
  charge(input: ChargeInput): Promise<ChargeResult>;
}
