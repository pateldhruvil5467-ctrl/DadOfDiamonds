import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { PRODUCT_CURRENCY } from "@/lib/admin/constants";
import type { CreateProductInput, UpdateProductInput } from "@/lib/validations/product";

export class CategoryNotFoundError extends Error {
  constructor() {
    super("Selected category does not exist.");
  }
}

export class ProductNotFoundError extends Error {
  constructor() {
    super("Product not found.");
  }
}

export class DuplicateSlugError extends Error {
  constructor() {
    super("A product with this slug already exists.");
  }
}

export class DuplicateSkuError extends Error {
  constructor() {
    super("A product with this SKU already exists.");
  }
}

/**
 * Thrown when an edit's `expectedStock` no longer matches the DB — e.g. a customer's checkout
 * decremented stock after the admin loaded the edit form but before they saved. Carries the
 * actual current stock so the caller can show it back to the admin without another round trip.
 */
export class StockConflictError extends Error {
  constructor(public currentStock: number) {
    super(`Stock has changed since this page loaded (now ${currentStock}). Review and try again.`);
  }
}

const productWithRelations = {
  include: { images: { orderBy: { position: "asc" as const } }, category: true },
} satisfies Prisma.ProductDefaultArgs;

export type AdminProductDetail = Prisma.ProductGetPayload<typeof productWithRelations>;

// Prisma 7 + driver adapters nest the real Postgres constraint info under meta.driverAdapterError
// rather than a flat `target` array (same shape noted in lib/orders/create-order.ts) — matching
// on the constraint name directly in the serialized error is the reliable way to tell which
// unique field collided.
function uniqueConstraintField(error: unknown): "slug" | "sku" | null {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
    return null;
  }
  const serialized = JSON.stringify(error.meta ?? {});
  if (serialized.includes("Product_slug_key")) return "slug";
  if (serialized.includes("Product_sku_key")) return "sku";
  return null;
}

function throwForUniqueConstraint(error: unknown): never {
  const field = uniqueConstraintField(error);
  if (field === "slug") throw new DuplicateSlugError();
  if (field === "sku") throw new DuplicateSkuError();
  throw error;
}

async function assertCategoryExists(categoryId: string) {
  const category = await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } });
  if (!category) throw new CategoryNotFoundError();
}

/**
 * Creates a product + its images atomically. Currency is never read from `input` — it is always
 * PRODUCT_CURRENCY, set here, so there is no path (including a tampered request body) through
 * which a product could be created in a different currency.
 */
export async function createProduct(input: CreateProductInput): Promise<AdminProductDetail> {
  await assertCategoryExists(input.categoryId);

  try {
    return await prisma.product.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        price: new Prisma.Decimal(input.price),
        compareAtPrice: input.compareAtPrice != null ? new Prisma.Decimal(input.compareAtPrice) : null,
        currency: PRODUCT_CURRENCY,
        categoryId: input.categoryId,
        material: input.material,
        sku: input.sku,
        stock: input.stock,
        isFeatured: input.isFeatured,
        isUnisex: input.isUnisex,
        images: {
          create: input.images.map((image, index) => ({
            url: image.url,
            altText: image.altText || null,
            position: index,
          })),
        },
      },
      ...productWithRelations,
    });
  } catch (error) {
    throwForUniqueConstraint(error);
  }
}

/**
 * Updates a product's scalar fields, stock, and full image set. The entire update — every field,
 * not just stock — is applied through ONE conditional `updateMany` guarded on
 * `stock = input.expectedStock`. This is a deliberate all-or-nothing choice: if stock has moved
 * since the admin loaded the form, the whole edit is rejected rather than partially applied,
 * which is simpler to reason about and explain than "your price change saved but your stock
 * change didn't." The images replace only runs after that guarded update has actually matched a
 * row, so a stock conflict leaves the product completely untouched.
 */
export async function updateProduct(id: string, input: UpdateProductInput): Promise<AdminProductDetail> {
  const existing = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw new ProductNotFoundError();

  await assertCategoryExists(input.categoryId);

  try {
    await prisma.$transaction(async (tx) => {
      const guardedUpdate = await tx.product.updateMany({
        where: { id, stock: input.expectedStock },
        data: {
          name: input.name,
          slug: input.slug,
          description: input.description,
          price: new Prisma.Decimal(input.price),
          compareAtPrice: input.compareAtPrice != null ? new Prisma.Decimal(input.compareAtPrice) : null,
          currency: PRODUCT_CURRENCY,
          categoryId: input.categoryId,
          material: input.material,
          sku: input.sku,
          stock: input.stock,
          isFeatured: input.isFeatured,
          isUnisex: input.isUnisex,
        },
      });

      if (guardedUpdate.count !== 1) {
        // Product existence was already confirmed above and products are never hard-deleted, so
        // a mismatch here can only mean the stock guard failed — read back the real current
        // value to report in the conflict.
        const current = await tx.product.findUnique({ where: { id }, select: { stock: true } });
        throw new StockConflictError(current?.stock ?? input.expectedStock);
      }

      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.productImage.createMany({
        data: input.images.map((image, index) => ({
          productId: id,
          url: image.url,
          altText: image.altText || null,
          position: index,
        })),
      });
    });
  } catch (error) {
    if (error instanceof StockConflictError) throw error;
    throwForUniqueConstraint(error);
  }

  return prisma.product.findUniqueOrThrow({ where: { id }, ...productWithRelations });
}

/**
 * Activation state is a small, single-purpose update kept deliberately separate from
 * updateProduct() — it never touches name/price/stock/images, and never uses the stock
 * freshness guard (there is nothing stock-related to race against here).
 */
export async function setProductActive(id: string, isActive: boolean): Promise<AdminProductDetail> {
  const existing = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw new ProductNotFoundError();

  return prisma.product.update({
    where: { id },
    data: { isActive, archivedAt: isActive ? null : new Date() },
    ...productWithRelations,
  });
}

/** JSON-safe shape for API responses — Decimal fields become strings, never a raw Decimal. */
export interface AdminProductJson {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  compareAtPrice: string | null;
  currency: string;
  categoryId: string;
  categoryName: string;
  material: string;
  sku: string;
  stock: number;
  isFeatured: boolean;
  isUnisex: boolean;
  isActive: boolean;
  archivedAt: string | null;
  images: { url: string; altText: string | null; position: number }[];
}

export interface AdminApiValidationIssue {
  path: string;
  message: string;
}

export interface AdminProductSuccessResponse {
  status: "created" | "updated" | "activated" | "deactivated";
  product: AdminProductJson;
}

export interface AdminProductErrorResponse {
  status: "error";
  error: string;
  issues?: AdminApiValidationIssue[];
  currentStock?: number;
}

export type AdminProductApiResponse = AdminProductSuccessResponse | AdminProductErrorResponse;

export function serializeAdminProduct(product: AdminProductDetail): AdminProductJson {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price.toString(),
    compareAtPrice: product.compareAtPrice ? product.compareAtPrice.toString() : null,
    currency: product.currency,
    categoryId: product.categoryId,
    categoryName: product.category.name,
    material: product.material,
    sku: product.sku,
    stock: product.stock,
    isFeatured: product.isFeatured,
    isUnisex: product.isUnisex,
    isActive: product.isActive,
    archivedAt: product.archivedAt ? product.archivedAt.toISOString() : null,
    images: product.images.map((image) => ({ url: image.url, altText: image.altText, position: image.position })),
  };
}
