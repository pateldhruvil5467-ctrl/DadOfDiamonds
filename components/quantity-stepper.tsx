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
    <div className="inline-flex items-center gap-5 border-b border-border-strong pb-2" role="group" aria-label={label}>
      <button
        type="button"
        onClick={onDecrease}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className="text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:text-accent transition-colors"
      >
        −
      </button>
      <span className="w-4 text-center text-sm" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={onIncrease}
        disabled={value >= max}
        aria-label="Increase quantity"
        className="text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:text-accent transition-colors"
      >
        +
      </button>
    </div>
  );
}
