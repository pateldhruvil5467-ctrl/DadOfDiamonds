import { env } from "@/lib/env";
import { MockPaymentProvider } from "@/lib/payments/mock-provider";
import type { PaymentProvider } from "@/lib/payments/types";

/**
 * Factory for the active payment provider. Only "mock" is implemented — MOCK is the active
 * provider for this project. STRIPE/RAZORPAY are documented targets (see types.ts) for a
 * future integration, not implemented here, per the approved architecture.
 */
function createPaymentProvider(): PaymentProvider {
  switch (env.PAYMENT_PROVIDER) {
    case "mock":
      return new MockPaymentProvider();
    case "stripe":
    case "razorpay":
      throw new Error(
        `PAYMENT_PROVIDER="${env.PAYMENT_PROVIDER}" is not implemented yet. Only "mock" is available.`,
      );
    default:
      return new MockPaymentProvider();
  }
}

export const paymentProvider: PaymentProvider = createPaymentProvider();

export type { ChargeInput, ChargeResult, PaymentProvider } from "@/lib/payments/types";
