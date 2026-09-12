/**
 * A single small four-point glint — fades in, expands slightly, rotates 45°, fades out. Runs
 * on a long 5s cycle where the flash itself occupies only its final ~10%, so it reads as rare
 * and occasional rather than a continuously pulsing icon. Pure CSS animation, respects
 * prefers-reduced-motion via `motion-safe:` plus the global override in globals.css. Always
 * decorative — aria-hidden.
 */
export function DiamondSparkle({
  className = "",
  size = 16,
  delaySeconds = 0,
  color = "var(--champagne)",
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
      className={`motion-safe:animate-glint pointer-events-none ${className}`}
      style={{ animationDelay: `${delaySeconds}s` }}
    >
      <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill={color} />
    </svg>
  );
}
