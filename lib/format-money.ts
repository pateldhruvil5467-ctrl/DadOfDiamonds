import type { Prisma } from "@/generated/prisma/client";

/**
 * Formats a Decimal (or numeric string) money value. All money handling in this app goes
 * through Prisma's Decimal type end-to-end — this is the one place values are converted to a
 * JS number, and only for display formatting, never for calculation.
 */
export function formatMoney(
  amount: Prisma.Decimal | number | string,
  currency: string = "EUR",
) {
  const numeric = typeof amount === "object" ? amount.toNumber() : Number(amount);
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency,
  }).format(numeric);
}
