/**
 * A single small four-point sparkle/glint. Pure CSS animation (opacity + transform), respects
 * prefers-reduced-motion via the `motion-safe:` variant plus the global override in
 * globals.css. Purely decorative — always aria-hidden.
 */
export function DiamondSparkle({
  className = "",
  size = 16,
  delaySeconds = 0,
  color = "var(--silver)",
}: {
  className?: string;
  size?: number;
  delaySeconds?: number;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      className={`motion-safe:animate-sparkle pointer-events-none ${className}`}
      style={{ animationDelay: `${delaySeconds}s` }}
    >
      <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill={color} />
    </svg>
  );
}
