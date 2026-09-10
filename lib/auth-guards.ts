import { Role } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export class UnauthorizedError extends Error {
  status = 401;
}

export class ForbiddenError extends Error {
  status = 403;
}

/**
 * Returns the authenticated user's id, or throws UnauthorizedError. Use this in any route
 * handler/server action that requires a signed-in user but not necessarily an admin.
 */
export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new UnauthorizedError("You must be signed in.");
  }
  return session.user.id;
}

/**
 * Verifies the caller is an authenticated admin. This does NOT trust the JWT's `role` claim
 * for the authorization decision, because that claim can go stale (e.g. an admin demoted
 * after their token was issued keeps a token that still says ADMIN until it's refreshed).
 * It only reads the session to get the authenticated userId, then does a fresh DB read and
 * checks the CURRENT role. The JWT-embedded role remains fine for cheap, non-security UI
 * decisions (e.g. showing/hiding the admin nav link) — but every sensitive mutation must call
 * this, not read session.user.role directly.
 *
 * middleware.ts also redirects non-admins away from /admin/* for UX, but that is not a
 * substitute for this check — every admin API route/server action calls this independently.
 */
export async function requireAdmin(): Promise<{ id: string; role: Role }> {
  const userId = await requireUserId();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user || user.role !== Role.ADMIN) {
    throw new ForbiddenError("Admin access required.");
  }

  return user;
}
