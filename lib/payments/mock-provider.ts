import type { ChargeInput, ChargeResult, PaymentProvider } from "@/lib/payments/types";

/**
 * Test-only hook: when an orderId is added to this set, the next charge() call for that
 * order deterministically fails instead of succeeding. Used exclusively by the verification
 * suite to exercise the payment-failure/restock path — never touched by real request flow.
 */
const forcedFailureOrderIds = new Set<string>();

export function forcePaymentFailureForOrder(orderId: string) {
  forcedFailureOrderIds.add(orderId);
}

export function clearForcedPaymentFailure(orderId: string) {
  forcedFailureOrderIds.delete(orderId);
}

/**
 * MockPaymentProvider.charge is a pure, deterministic function of its input: no randomness,
 * no internal mutable state driving the outcome (the forced-failure set above is a test hook,
 * not runtime state the provider depends on for normal operation). Calling it twice with the
 * same idempotencyKey yields byte-identical output — this mirrors how a real idempotent
 * provider call should behave, even though the actual duplicate-prevention in this app
 * happens at the DB layer in lib/payments/settle-payment.ts, not inside this mock.
 */
export class MockPaymentProvider implements PaymentProvider {
  async charge(input: ChargeInput): Promise<ChargeResult> {
    if (forcedFailureOrderIds.has(input.orderId)) {
      return {
        success: false,
        error: "Mock provider: forced test failure",
      };
    }

    return {
      success: true,
      reference: `MOCK-${input.idempotencyKey}`,
    };
  }
}
