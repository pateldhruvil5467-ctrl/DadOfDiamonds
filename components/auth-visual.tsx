import { DiamondMark } from "@/components/brand-logo";
import { FloatingDiamonds } from "@/components/floating-diamonds";
import { DiamondBeam } from "@/components/diamond-beam";

/**
 * The decorative left panel shared by /login and /register — cinematic dark visual, hidden on
 * small screens where the form takes the full width.
 */
export function AuthVisual() {
  return (
    <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-background-deep p-14">
      <FloatingDiamonds />
      <DiamondBeam className="top-0" />

      <DiamondMark className="relative h-8 w-8" />

      <div className="relative">
        <p className="eyebrow">Surat — The Diamond City</p>
        <p className="mt-5 font-display text-4xl leading-[1.1] max-w-xs">
          Precision cut.
          <br />
          Quietly worn.
        </p>
      </div>
    </div>
  );
}
