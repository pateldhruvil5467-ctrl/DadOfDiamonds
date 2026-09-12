/**
 * The DadOfDiamonds mark — a single-weight engraved line drawing, not a filled icon. A
 * vertical stem (the "D") opens into a faceted diamond silhouette traced in outline only, with
 * two internal facet lines suggesting a cut stone. Rendered purely as strokes so it reads as a
 * jewelry monogram/crest rather than an app icon. Pure SVG, no raster assets.
 */
type BrandLogoProps = {
  variant?: "full" | "mark";
  className?: string;
  markClassName?: string;
};

export function BrandLogo({ variant = "full", className, markClassName }: BrandLogoProps) {
  return (
    <span className={`inline-flex items-center gap-3.5 ${className ?? ""}`}>
      <DiamondMark className={markClassName ?? "h-7 w-7"} />
      {variant === "full" && (
        <span className="font-display text-lg tracking-[0.14em] whitespace-nowrap text-foreground">
          DAD OF DIAMONDS
        </span>
      )}
    </span>
  );
}

export function DiamondMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 44" className={className} aria-hidden="true" fill="none">
      {/* Stem + faceted bowl, one continuous outline */}
      <path
        d="M13 6 V38 M13 6 H21 L33 15 L33 29 L21 38 H13"
        stroke="currentColor"
        className="text-accent"
        strokeWidth="1.3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Crown facet lines */}
      <path
        d="M33 22 L13 12 M33 22 L13 22 M33 22 L13 32"
        stroke="currentColor"
        className="text-accent"
        strokeWidth="0.6"
        strokeLinecap="round"
        opacity="0.75"
      />
    </svg>
  );
}
