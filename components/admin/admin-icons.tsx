/**
 * Hand-written inline icons for the admin console, matching the minimal stroke style of
 * components/icons.tsx — kept to exactly what the admin sidebar/topbar use.
 */
type IconProps = { className?: string };

export function DashboardIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden="true">
      <rect x="3.5" y="3.5" width="7" height="7" rx="0.5" />
      <rect x="13.5" y="3.5" width="7" height="4.5" rx="0.5" />
      <rect x="13.5" y="10.5" width="7" height="10" rx="0.5" />
      <rect x="3.5" y="13" width="7" height="7.5" rx="0.5" />
    </svg>
  );
}

export function ProductsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden="true">
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" strokeLinejoin="round" />
      <path d="M4 7.5L12 12l8-4.5M12 12v9" strokeLinejoin="round" />
    </svg>
  );
}

export function OrdersIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden="true">
      <path d="M6 3.5h12v17l-3-2-3 2-3-2-3 2v-17z" strokeLinejoin="round" />
      <path d="M8.5 8h7M8.5 11.5h7M8.5 15h4" strokeLinecap="round" />
    </svg>
  );
}

export function SignOutIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden="true">
      <path d="M9 4H5.5A1.5 1.5 0 004 5.5v13A1.5 1.5 0 005.5 20H9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 16l4-4-4-4M18 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}
