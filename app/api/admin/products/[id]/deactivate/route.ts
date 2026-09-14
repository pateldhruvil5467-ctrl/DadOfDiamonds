import { NextResponse } from "next/server";
import { requireAdmin, UnauthorizedError, ForbiddenError } from "@/lib/auth-guards";
import {
  setProductActive,
  serializeAdminProduct,
  ProductNotFoundError,
  type AdminProductApiResponse,
} from "@/lib/admin/products";

/**
 * POST /api/admin/products/[id]/deactivate — archive a product (isActive=false, archivedAt=now).
 * Never a hard delete: OrderItem snapshots keep historical orders correct regardless, and the
 * product row itself is untouched other than these two fields. See lib/admin/products.ts.
 */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return json({ status: "error", error: "unauthorized" }, 401);
    if (error instanceof ForbiddenError) return json({ status: "error", error: "forbidden" }, 403);
    throw error;
  }

  const { id } = await params;

  try {
    const product = await setProductActive(id, false);
    return json({ status: "deactivated", product: serializeAdminProduct(product) }, 200);
  } catch (error) {
    if (error instanceof ProductNotFoundError) {
      return json({ status: "error", error: "product_not_found" }, 404);
    }
    console.error("Admin product deactivate failed:", error);
    return json({ status: "error", error: "server_error" }, 500);
  }
}

function json(body: AdminProductApiResponse, status: number) {
  return NextResponse.json(body, { status });
}
