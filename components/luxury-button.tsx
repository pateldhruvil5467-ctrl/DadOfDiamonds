import Link from "next/link";

type Variant = "solid" | "outline" | "text";

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

const BASE = "inline-flex items-center justify-center gap-2 text-sm tracking-[0.18em] uppercase transition-colors duration-300";
const VARIANT_CLASS: Record<Variant, string> = {
  solid: "bg-accent text-accent-foreground px-8 py-3.5 hover:bg-foreground",
  outline: "border border-accent text-foreground px-8 py-3.5 hover:bg-accent hover:text-accent-foreground",
  text: "link-reveal text-foreground px-0 py-1",
};

function Arrow() {
  return (
    <svg viewBox="0 0 16 10" width="16" height="10" aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
      <path d="M0 5h14M9 1l4.5 4L9 9" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function LuxuryButton(props: ButtonAsLink | ButtonAsButton) {
  const { variant = "solid", arrow, className = "", children } = props;
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
