import Link from "next/link";

const CATEGORY_LINKS = [
  { label: "Rings", href: "/products?category=rings" },
  { label: "Earrings", href: "/products?category=earrings" },
  { label: "Chains & Necklaces", href: "/products?category=chains-necklaces" },
  { label: "Bracelets", href: "/products?category=bracelets" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12 flex flex-col gap-10 sm:flex-row sm:justify-between">
        <div className="max-w-sm">
          <p className="font-display text-xl tracking-wide">DAD OF DIAMONDS</p>
          <p className="mt-3 text-sm text-muted">
            Fine diamond jewelry, crafted for everyone. Rings, earrings, chains, and bracelets
            made to last a lifetime.
          </p>
        </div>

        <nav aria-label="Shop categories">
          <p className="text-xs uppercase tracking-widest text-muted">Shop</p>
          <ul className="mt-4 flex flex-col gap-2 text-sm">
            {CATEGORY_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-accent transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-border">
        <p className="mx-auto max-w-7xl px-6 py-6 text-xs text-muted">
          © {new Date().getFullYear()} Dad of Diamonds. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
