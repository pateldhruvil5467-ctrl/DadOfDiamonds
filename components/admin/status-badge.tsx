import type { OrderStatus, PaymentStatus } from "@/generated/prisma/client";

export type StatusTone = "neutral" | "accent" | "success" | "danger";

const TONE_CLASS: Record<StatusTone, string> = {
  neutral: "text-muted border-border-strong",
  accent: "text-accent border-accent/40",
  success: "text-[var(--status-success)] border-[var(--status-success)]/40",
  danger: "text-[var(--status-danger)] border-[var(--status-danger)]/40",
};

// Color is never the only signal — the text label always states the status in words, the
// border/dot color is a secondary reinforcement for quick scanning.
export function StatusBadge({ label, tone }: { label: string; tone: StatusTone }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.08em] ${TONE_CLASS[tone]}`}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

const ORDER_STATUS_TONE: Record<OrderStatus, StatusTone> = {
  PENDING: "neutral",
  CONFIRMED: "accent",
  PROCESSING: "accent",
  SHIPPED: "accent",
  DELIVERED: "success",
  CANCELLED: "danger",
};

const PAYMENT_STATUS_TONE: Record<PaymentStatus, StatusTone> = {
  PENDING: "neutral",
  PAID: "success",
  FAILED: "danger",
  REFUNDED: "neutral",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <StatusBadge label={status} tone={ORDER_STATUS_TONE[status]} />;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <StatusBadge label={status} tone={PAYMENT_STATUS_TONE[status]} />;
}

export function ProductStateBadge({ isActive }: { isActive: boolean }) {
  return <StatusBadge label={isActive ? "Active" : "Inactive"} tone={isActive ? "success" : "neutral"} />;
}
