import Link from "next/link";

type Variant = "line" | "solid" | "outline";

type CommonProps = {
  variant?: Variant;
  arrow?: boolean;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsLink = CommonProps & {
  href: string;
  type?: never;
  onClick?: never;
  disabled?: never;
};

type ButtonAsButton = CommonProps & {
  href?: undefined;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
};

const BASE = "inline-flex items-center justify-center gap-2.5 text-[11px] tracking-[0.24em] uppercase transition-all duration-300";
// "line" is the default everywhere — a thin-bordered or underlined label, not a filled block.
// "solid" (ivory fill, gold on hover) is reserved for the one or two moments per page that
// need the strongest visual weight (Add to Bag, Place Order) — gold stays an accent, not a
// button color.
const VARIANT_CLASS: Record<Variant, string> = {
  line: "link-reveal text-foreground px-0 py-1",
  outline: "border border-border-strong text-foreground px-8 py-3.5 hover:border-accent hover:text-accent",
  solid: "bg-foreground text-background px-9 py-4 hover:bg-accent",
};

function Arrow() {
  return (
    <svg viewBox="0 0 16 10" width="15" height="9" aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
      <path d="M0 5h14M9 1l4.5 4L9 9" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function LuxuryButton(props: ButtonAsLink | ButtonAsButton) {
  const { variant = "line", arrow, className = "", children } = props;
  const classes = `${BASE} ${VARIANT_CLASS[variant]} group disabled:opacity-40 disabled:cursor-not-allowed ${className}`;

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={classes}>
        {children}
        {arrow && <Arrow />}
      </Link>
    );
  }

  const { type = "button", onClick, disabled } = props as ButtonAsButton;
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
      {arrow && <Arrow />}
    </button>
  );
}
