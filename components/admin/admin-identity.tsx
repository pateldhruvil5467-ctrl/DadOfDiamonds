import { adminSignOutAction } from "@/lib/actions/admin-sign-out";
import { SignOutIcon } from "@/components/admin/admin-icons";

export function AdminIdentity({ name, email }: { name: string | null; email: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
      <div className="min-w-0">
        <p className="truncate text-[13px] text-foreground">{name ?? "Admin"}</p>
        <p className="truncate text-xs text-muted">{email}</p>
      </div>
      <form action={adminSignOutAction}>
        <button
          type="submit"
          aria-label="Sign out"
          title="Sign out"
          className="flex items-center gap-1.5 p-1.5 text-muted hover:text-accent transition-colors"
        >
          <SignOutIcon className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
