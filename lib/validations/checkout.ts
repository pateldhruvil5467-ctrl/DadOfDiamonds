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
