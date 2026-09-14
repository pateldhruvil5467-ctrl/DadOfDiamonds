import { NextResponse } from "next/server";
import { requireAdmin, UnauthorizedError, ForbiddenError } from "@/lib/auth-guards";
import {
  setProductActive,
  serializeAdminProduct,
  ProductNotFoundError,
  type AdminProductApiResponse,
} from "@/lib/admin/products";

/**
 * POST /api/admin/products/[id]/activate — reactivate a product. Kept as its own tiny endpoint,
 * deliberately separate from PATCH /api/admin/products/[id], so activation state can never be
 * changed as a side effect of an unrelated field edit and never goes through the stock-freshness
 * guard (there's nothing stock-related here to race against).
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
    const product = await setProductActive(id, true);
    return json({ status: "activated", product: serializeAdminProduct(product) }, 200);
  } catch (error) {
    if (error instanceof ProductNotFoundError) {
      return json({ status: "error", error: "product_not_found" }, 404);
    }
    console.error("Admin product activate failed:", error);
    return json({ status: "error", error: "server_error" }, 500);
  }
}

function json(body: AdminProductApiResponse, status: number) {
  return NextResponse.json(body, { status });
}
