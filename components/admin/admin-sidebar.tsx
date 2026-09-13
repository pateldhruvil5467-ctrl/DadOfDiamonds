import Link from "next/link";
import { DiamondMark } from "@/components/brand-logo";
import { AdminNavLinks } from "@/components/admin/admin-nav-links";
import { AdminIdentity } from "@/components/admin/admin-identity";

export function AdminSidebar({ name, email }: { name: string | null; email: string }) {
  return (
    <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:justify-between lg:border-r lg:border-border lg:bg-background-deep lg:px-5 lg:py-6">
      <div>
        <Link href="/admin" className="flex items-center gap-3 px-1 pb-8">
          <DiamondMark className="h-6 w-6 text-accent" />
          <span className="font-display text-sm tracking-[0.14em] text-foreground">DAD OF DIAMONDS</span>
        </Link>
        <nav aria-label="Admin">
          <AdminNavLinks />
        </nav>
      </div>

      <AdminIdentity name={name} email={email} />
    </aside>
  );
}
