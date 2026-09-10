"use client";

type QuantityStepperProps = {
  value: number;
  min?: number;
  max: number;
  onDecrease: () => void;
  onIncrease: () => void;
  label: string;
};

export function QuantityStepper({
  value,
  min = 1,
  max,
  onDecrease,
  onIncrease,
  label,
}: QuantityStepperProps) {
  return (
    <div className="inline-flex items-center border border-border" role="group" aria-label={label}>
      <button
        type="button"
        onClick={onDecrease}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className="px-3 py-2 text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface transition-colors"
      >
        −
      </button>
      <span className="w-10 text-center text-sm" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={onIncrease}
        disabled={value >= max}
        aria-label="Increase quantity"
        className="px-3 py-2 text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface transition-colors"
      >
        +
      </button>
    </div>
  );
}
