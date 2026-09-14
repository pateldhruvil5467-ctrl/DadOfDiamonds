import { z } from "zod";
import { MAX_PRODUCT_IMAGES } from "@/lib/admin/constants";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// No `position` field here on purpose — position is derived server-side from the image's index
// within the submitted array (see lib/admin/products.ts), so array order IS the source of truth
// for display order and there is no separate value that could drift out of sync with it.
export const productImageSchema = z.object({
  url: z.string().trim().min(1, "Image URL is required").max(2000, "Image URL is too long"),
  altText: z.string().trim().max(200, "Alt text is too long").optional().or(z.literal("")),
});
export type ProductImageInput = z.infer<typeof productImageSchema>;

// Shared fields between create and edit. Deliberately has NO `currency` field — the store is
// single-currency (EUR) and currency is always set server-side (see PRODUCT_CURRENCY), never
// accepted from the client, so there is no field here for a request to even attempt to set it.
const productCoreSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Slug is required")
    .max(200)
    .regex(slugPattern, "Slug must be lowercase letters, numbers, and hyphens only"),
  description: z.string().trim().min(1, "Description is required").max(5000),
  // Plain z.number() (not z.coerce), matching checkoutItemSchema's convention elsewhere in this
  // codebase — the client always sends genuine JSON numbers (react-hook-form's valueAsNumber),
  // so coercion isn't needed, and this keeps the schema's input/output types identical, which
  // react-hook-form's typed resolver requires to line up cleanly with useForm<T>.
  price: z.number().positive("Price must be greater than 0").max(1_000_000, "Price is too large"),
  // Plain optional number — the client converts an empty field to `undefined` itself (via
  // react-hook-form's `setValueAs`, not `valueAsNumber`, which would produce NaN instead) so this
  // schema's input/output types stay identical for the typed resolver. See ProductForm.
  compareAtPrice: z
    .number()
    .positive("Compare-at price must be greater than 0")
    .max(1_000_000, "Compare-at price is too large")
    .optional(),
  categoryId: z.string().min(1, "Category is required"),
  material: z.string().trim().min(1, "Material is required").max(120),
  sku: z.string().trim().min(1, "SKU is required").max(60),
  // No `.default()` here on purpose — a Zod default makes the schema's input type optional while
  // the output stays required, which breaks react-hook-form's typed resolver (it needs
  // useForm<T>'s single type to match both). The form always sends an explicit boolean (a
  // checkbox's registered value is never undefined), so a plain required boolean is correct here.
  isFeatured: z.boolean(),
  isUnisex: z.boolean(),
  images: z
    .array(productImageSchema)
    .min(1, "At least one image is required")
    .max(MAX_PRODUCT_IMAGES, `A product can have at most ${MAX_PRODUCT_IMAGES} images`),
});

function withComparePriceRule<T extends z.ZodTypeAny>(schema: T) {
  return schema.superRefine((data, ctx) => {
    const { price, compareAtPrice } = data as { price: number; compareAtPrice?: number };
    if (compareAtPrice !== undefined && compareAtPrice <= price) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Compare-at price must be greater than the price",
        path: ["compareAtPrice"],
      });
    }
  });
}

// Create: stock is just the initial value — there is no prior value to race against, so no
// freshness guard is needed here (unlike updateProductSchema below).
export const createProductSchema = withComparePriceRule(
  productCoreSchema.extend({
    stock: z.number().int().min(0, "Stock cannot be negative"),
  }),
);
export type CreateProductInput = z.infer<typeof createProductSchema>;

// Edit: `stock` is the admin's desired new value; `expectedStock` is the stock value the edit
// form was loaded with. The API uses expectedStock as a conditional-update guard (WHERE stock =
// expectedStock) so a stock change that happened between page-load and submit — e.g. a
// customer's checkout decrementing it — can never be silently overwritten. See
// lib/admin/products.ts updateProduct() and StockConflictError.
export const updateProductSchema = withComparePriceRule(
  productCoreSchema.extend({
    stock: z.number().int().min(0, "Stock cannot be negative"),
    expectedStock: z.number().int().min(0, "expectedStock is required"),
  }),
);
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const orderStatusUpdateSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
});
export type OrderStatusUpdateInput = z.infer<typeof orderStatusUpdateSchema>;
