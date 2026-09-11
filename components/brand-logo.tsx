/**
 * The DadOfDiamonds brand mark — a custom geometric "D" built from a faceted diamond bowl
 * fused to a vertical stem, with three crown-facet lines cut through it. Pure SVG, no raster
 * assets, no external icon library. `variant="mark"` renders the icon alone (mobile nav,
 * compact footer use); `variant="full"` adds the wordmark.
 */
type BrandLogoProps = {
  variant?: "full" | "mark";
  className?: string;
  markClassName?: string;
};

export function BrandLogo({ variant = "full", className, markClassName }: BrandLogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className ?? ""}`}>
      <DiamondMark className={markClassName ?? "h-8 w-8"} />
      {variant === "full" && (
        <span className="font-display text-xl tracking-[0.08em] whitespace-nowrap">
          <span className="text-foreground">DAD OF</span>{" "}
          <span className="text-accent">DIAMONDS</span>
        </span>
      )}
    </span>
  );
}

export function DiamondMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      {/* Stem of the D */}
      <rect x="5" y="4" width="6" height="32" rx="1" fill="currentColor" className="text-accent" />
      {/* Faceted diamond bowl */}
      <polygon
        points="11,4 21,4 34,13 34,27 21,36 11,36"
        fill="currentColor"
        className="text-accent"
      />
      {/* Crown facet lines, cut through the bowl in the page background color */}
      <g stroke="var(--background)" strokeWidth="0.9" strokeLinecap="round">
        <line x1="34" y1="20" x2="11" y2="4" />
        <line x1="34" y1="20" x2="11" y2="20" />
        <line x1="34" y1="20" x2="11" y2="36" />
      </g>
      {/* A single quiet sparkle at the tip — decorative only */}
      <g className="motion-safe:animate-sparkle" style={{ transformOrigin: "34px 13px" }}>
        <path d="M34 10 L35 12.5 L37.5 13 L35 13.5 L34 16 L33 13.5 L30.5 13 L33 12.5 Z" fill="var(--silver)" />
      </g>
    </svg>
  );
}
