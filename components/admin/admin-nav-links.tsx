"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardIcon, ProductsIcon, OrdersIcon } from "@/components/admin/admin-icons";

const LINKS = [
  { label: "Dashboard", href: "/admin", icon: DashboardIcon },
  { label: "Products", href: "/admin/products", icon: ProductsIcon },
  { label: "Orders", href: "/admin/orders", icon: OrdersIcon },
];

export function AdminNavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <ul className="flex flex-col gap-1">
      {LINKS.map((link) => {
        // Exact match for /admin itself (otherwise it would stay "active" on every sub-route);
        // prefix match for nested sections so /admin/products/anything still highlights.
        const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
        const Icon = link.icon;
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-sm px-3 py-2.5 text-[13px] tracking-wide transition-colors ${
                active
                  ? "bg-surface text-foreground"
                  : "text-muted hover:text-foreground hover:bg-surface/60"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
