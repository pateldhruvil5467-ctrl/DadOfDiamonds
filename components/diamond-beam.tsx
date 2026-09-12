/**
 * A single soft, blurred band of light that eases diagonally across a dark section, like a
 * beam catching a facet as it slowly turns. One instance per section — this is not a repeating
 * decorative pattern, it's meant to be noticed once, subtly, not tracked continuously.
 */
export function DiamondBeam({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-y-[-20%] left-0 w-[45%] motion-safe:animate-beam ${className}`}
      style={{
        background:
          "linear-gradient(100deg, transparent 30%, rgba(244,239,228,0.05) 48%, rgba(214,177,101,0.07) 50%, rgba(244,239,228,0.05) 52%, transparent 70%)",
        filter: "blur(6px)",
      }}
    />
  );
}
