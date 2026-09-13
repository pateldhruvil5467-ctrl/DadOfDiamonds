export function StatCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number | string;
  tone?: "neutral" | "accent" | "danger";
}) {
  const valueClass = tone === "accent" ? "text-accent" : tone === "danger" ? "text-[var(--status-danger)]" : "text-foreground";

  return (
    <div className="border border-border bg-background-deep px-5 py-5">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className={`mt-3 font-display text-3xl ${valueClass}`}>{value}</p>
    </div>
  );
}
