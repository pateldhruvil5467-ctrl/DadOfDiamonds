import { DiamondMark } from "@/components/brand-logo";

/**
 * The decorative left panel shared by /login and /register — a quiet warm pearl visual, hidden
 * on small screens where the form takes the full width. Deliberately undecorated: no floating
 * diamond motifs here, just typography and negative space.
 */
export function AuthVisual() {
  return (
    <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-background-deep p-14">
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
