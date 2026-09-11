import { z } from "zod";
import { addressSchema } from "@/lib/validations/address";

/**
 * Checkout only ever accepts product ids + quantities from the client — no price or total
 * field exists on this schema on purpose. The server always recomputes unitPrice/subtotal/
 * total from the current DB Product rows inside the checkout transaction; anything the client
 * might send for a price is structurally impossible to submit, let alone trust.
 */
export const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().max(50),
});

export const checkoutSchema = z.object({
  idempotencyKey: z.string().uuid("idempotencyKey must be a UUID"),
  items: z.array(checkoutItemSchema).min(1, "Cart is empty"),
  // Either reuse a saved address...
  addressId: z.string().min(1).optional(),
  // ...or submit a new one to save + use for this order.
  newAddress: addressSchema.optional(),
}).refine((data) => Boolean(data.addressId) !== Boolean(data.newAddress), {
  message: "Provide either addressId or newAddress, not both or neither",
  path: ["addressId"],
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

/**
 * POST /api/checkout response contract (Phase 2.3B). "order_created" means a real Order row
 * now exists — but its paymentStatus must always be checked, since order creation can succeed
 * while payment settlement fails. Money values are serialized as strings (never plain numbers)
 * to avoid any float round-tripping through JSON.
 */
export interface CheckoutValidationIssue {
  path: string;
  message: string;
}

export interface CheckoutOrderResult {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: string;
  currency: string;
}

export interface CheckoutSuccessResponse {
  status: "order_created";
  order: CheckoutOrderResult;
}

export interface CheckoutErrorResponse {
  status: "error";
  error: string;
  issues?: CheckoutValidationIssue[];
}

export type CheckoutApiResponse = CheckoutSuccessResponse | CheckoutErrorResponse;
