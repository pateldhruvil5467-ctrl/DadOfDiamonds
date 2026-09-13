import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { adminSignOutAction } from "@/lib/actions/admin-sign-out";
import { SignOutIcon } from "@/components/admin/admin-icons";

// Persistent utility strip — always visible, independent of which admin page is active. Each
// page renders its own title/description directly in its content (see AdminPageHeading) so
// this strip stays purely chrome: mobile nav trigger on the left, a compact identity/sign-out
// affordance on the right for screens where the sidebar (which already carries this) is hidden.
export function AdminTopbar({ name, email }: { name: string | null; email: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border bg-background px-5 py-4 lg:px-10">
      <AdminMobileNav name={name} email={email} />
      <span className="hidden lg:block text-xs uppercase tracking-[0.2em] text-muted">Operations Console</span>

      <div className="flex items-center gap-3 lg:hidden">
        <span className="truncate max-w-[40vw] text-xs text-muted">{email}</span>
        <form action={adminSignOutAction}>
          <button type="submit" aria-label="Sign out" title="Sign out" className="p-1.5 text-muted hover:text-accent transition-colors">
            <SignOutIcon className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
