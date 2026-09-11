import { DiamondMark } from "@/components/brand-logo";
import { FloatingDiamonds } from "@/components/floating-diamonds";

/**
 * The decorative left panel shared by /login and /register — cinematic dark visual, hidden on
 * small screens where the form takes the full width.
 */
export function AuthVisual() {
  return (
    <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-surface p-12 border-r border-border">
      <FloatingDiamonds />
      <svg
        viewBox="0 0 200 200"
        aria-hidden="true"
        className="motion-safe:animate-spin-slow pointer-events-none absolute -bottom-24 -left-24 h-[420px] w-[420px] opacity-[0.08]"
      >
        <polygon points="100,10 175,60 145,190 55,190 25,60" fill="none" stroke="var(--accent)" strokeWidth="1" />
        <path d="M100 10 L100 95 M25 60 L100 95 L175 60 M55 190 L100 95 L145 190" fill="none" stroke="var(--accent)" strokeWidth="0.75" />
      </svg>

      <DiamondMark className="relative h-9 w-9" />

      <div className="relative">
        <p className="eyebrow">Surat — The Diamond City</p>
        <p className="mt-4 font-display text-3xl leading-snug max-w-sm">
          Precision cut. Quietly worn. Made for everyone.
        </p>
      </div>
    </div>
  );
}
