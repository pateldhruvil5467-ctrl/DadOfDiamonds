import { redirect } from "next/navigation";
import { requireAdmin, UnauthorizedError, ForbiddenError } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";

// Security boundary for the entire /admin tree: requireAdmin() re-checks the CURRENT role from
// the database (not the JWT claim) and throws if the caller isn't an authenticated admin. It is
// called ONCE here, at the layout, rather than duplicated in every admin page — Next.js runs a
// route's layout for every nested route under it, including direct navigation to a deep URL
// like /admin/products, so there is no path into this tree that skips this check.
// middleware.ts also redirects non-admins away from /admin/* for UX, but that is a separate,
// weaker (JWT-only) check — this call is the real, non-bypassable authorization boundary. It is
// wrapped here so that boundary fails closed with a clean redirect rather than a raw thrown
// error, in the unlikely case this layout is ever reached without middleware having already
// caught the request (e.g. local middleware misconfiguration).
export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      redirect("/login?callbackUrl=%2Fadmin");
    }
    throw error;
  }

  const identity = await prisma.user.findUnique({
    where: { id: admin.id },
    select: { name: true, email: true },
  });

  const name = identity?.name ?? null;
  const email = identity?.email ?? "";

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AdminSidebar name={name} email={email} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar name={name} email={email} />
        <main className="flex-1 px-5 py-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
