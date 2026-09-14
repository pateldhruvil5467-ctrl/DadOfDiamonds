import { NextResponse } from "next/server";
import { requireAdmin, UnauthorizedError, ForbiddenError } from "@/lib/auth-guards";
import { updateProductSchema } from "@/lib/validations/product";
import {
  updateProduct,
  serializeAdminProduct,
  ProductNotFoundError,
  CategoryNotFoundError,
  DuplicateSlugError,
  DuplicateSkuError,
  StockConflictError,
  type AdminProductApiResponse,
} from "@/lib/admin/products";

/**
 * PATCH /api/admin/products/[id] — edit a product's scalar fields, stock, and full image set.
 * See lib/admin/products.ts updateProduct() for the stock-freshness guard: the whole update is
 * conditioned on `stock` still equalling the submitted `expectedStock`, so a stock change that
 * happened after the edit form loaded is never silently overwritten.
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return json({ status: "error", error: "unauthorized" }, 401);
    if (error instanceof ForbiddenError) return json({ status: "error", error: "forbidden" }, 403);
    throw error;
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ status: "error", error: "invalid_json" }, 400);
  }

  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      {
        status: "error",
        error: "validation_error",
        issues: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
      },
      400,
    );
  }

  try {
    const product = await updateProduct(id, parsed.data);
    return json({ status: "updated", product: serializeAdminProduct(product) }, 200);
  } catch (error) {
    if (error instanceof ProductNotFoundError) {
      return json({ status: "error", error: "product_not_found" }, 404);
    }
    if (error instanceof CategoryNotFoundError) {
      return json(
        { status: "error", error: "category_not_found", issues: [{ path: "categoryId", message: error.message }] },
        400,
      );
    }
    if (error instanceof DuplicateSlugError) {
      return json({ status: "error", error: "duplicate_slug", issues: [{ path: "slug", message: error.message }] }, 409);
    }
    if (error instanceof DuplicateSkuError) {
      return json({ status: "error", error: "duplicate_sku", issues: [{ path: "sku", message: error.message }] }, 409);
    }
    if (error instanceof StockConflictError) {
      return json(
        {
          status: "error",
          error: "stock_conflict",
          currentStock: error.currentStock,
          issues: [{ path: "expectedStock", message: error.message }],
        },
        409,
      );
    }
    console.error("Admin product update failed:", error);
    return json({ status: "error", error: "server_error" }, 500);
  }
}

function json(body: AdminProductApiResponse, status: number) {
  return NextResponse.json(body, { status });
}
