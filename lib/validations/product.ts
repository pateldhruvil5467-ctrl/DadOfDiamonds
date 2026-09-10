import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const productImageSchema = z.object({
  url: z.string().min(1, "Image URL is required"),
  altText: z.string().max(200).optional().or(z.literal("")),
  position: z.number().int().min(0).default(0),
});

export const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Slug is required")
    .max(200)
    .regex(slugPattern, "Slug must be lowercase letters, numbers, and hyphens only"),
  description: z.string().trim().min(1, "Description is required").max(5000),
  price: z.coerce.number().positive("Price must be greater than 0"),
  compareAtPrice: z.coerce.number().positive().optional(),
  categoryId: z.string().min(1, "Category is required"),
  material: z.string().trim().min(1, "Material is required").max(120),
  sku: z.string().trim().min(1, "SKU is required").max(60),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  isFeatured: z.boolean().default(false),
  isUnisex: z.boolean().default(true),
  images: z.array(productImageSchema).min(1, "At least one image is required"),
});
export type ProductInput = z.infer<typeof productSchema>;

export const orderStatusUpdateSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
});
export type OrderStatusUpdateInput = z.infer<typeof orderStatusUpdateSchema>;
