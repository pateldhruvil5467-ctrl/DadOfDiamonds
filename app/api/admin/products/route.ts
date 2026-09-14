import { NextResponse } from "next/server";
import { requireAdmin, UnauthorizedError, ForbiddenError } from "@/lib/auth-guards";
import { createProductSchema } from "@/lib/validations/product";
import {
  createProduct,
  serializeAdminProduct,
  CategoryNotFoundError,
  DuplicateSlugError,
  DuplicateSkuError,
  type AdminProductApiResponse,
} from "@/lib/admin/products";

/**
 * POST /api/admin/products — create a product. Authorization is re-checked here independently
 * of the /admin layout's guard (see lib/auth-guards.ts requireAdmin() for why the layout's check
 * is UX-only, not the security boundary).
 */
export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return json({ status: "error", error: "unauthorized" }, 401);
    if (error instanceof ForbiddenError) return json({ status: "error", error: "forbidden" }, 403);
    throw error;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ status: "error", error: "invalid_json" }, 400);
  }

  const parsed = createProductSchema.safeParse(body);
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
    const product = await createProduct(parsed.data);
    return json({ status: "created", product: serializeAdminProduct(product) }, 201);
  } catch (error) {
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
    console.error("Admin product create failed:", error);
    return json({ status: "error", error: "server_error" }, 500);
  }
}

function json(body: AdminProductApiResponse, status: number) {
  return NextResponse.json(body, { status });
}
