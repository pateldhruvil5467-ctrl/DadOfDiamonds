import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

const SHOP_LINKS = [
  { label: "Rings", href: "/products?category=rings" },
  { label: "Earrings", href: "/products?category=earrings" },
  { label: "Necklaces", href: "/products?category=chains-necklaces" },
  { label: "Bracelets", href: "/products?category=bracelets" },
];

const CUSTOMER_LINKS = [
  { label: "My Account", href: "/account" },
  { label: "Orders", href: "/account" },
  { label: "Cart", href: "/cart" },
];

const COMPANY_LINKS = [
  { label: "Craft", href: "/#craft" },
  { label: "Story", href: "/#story" },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-background">
      {/* Faint faceted diamond geometry, purely decorative */}
      <svg
        aria-hidden="true"
        viewBox="0 0 800 400"
        className="pointer-events-none absolute -bottom-24 -right-24 h-[420px] w-[420px] opacity-[0.05]"
      >
        <polygon points="400,20 620,140 540,360 260,360 180,140" fill="none" stroke="var(--champagne)" strokeWidth="1" />
        <path d="M400 20 L400 200 M180 140 L400 200 L620 140 M260 360 L400 200 L540 360" fill="none" stroke="var(--champagne)" strokeWidth="0.75" />
      </svg>

      <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-16 grid gap-14 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div className="max-w-sm">
          <BrandLogo markClassName="h-10 w-10" className="gap-4" />
          <p className="mt-7 text-sm text-muted leading-relaxed">
            Born in Surat, the world&rsquo;s diamond-cutting capital. Dad of Diamonds brings that
            precision to fine jewelry crafted for everyone.
          </p>
        </div>

        <FooterColumn title="Shop" links={SHOP_LINKS} />
        <FooterColumn title="Customer" links={CUSTOMER_LINKS} />
        <FooterColumn title="Company" links={COMPANY_LINKS} />
      </div>

      <div className="relative border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between text-xs text-muted">
          <p>© {new Date().getFullYear()} Dad of Diamonds. All rights reserved.</p>
          <p className="uppercase tracking-[0.2em]">Surat, India</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <nav aria-label={title}>
      <p className="text-xs uppercase tracking-[0.2em] text-muted">{title}</p>
      <ul className="mt-5 flex flex-col gap-3 text-sm">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="link-reveal hover:text-accent transition-colors">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
