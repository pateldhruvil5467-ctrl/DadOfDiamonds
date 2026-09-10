import { z } from "zod";

export const addressSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(120),
  line1: z.string().trim().min(1, "Address line 1 is required").max(200),
  line2: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().min(1, "City is required").max(100),
  state: z.string().trim().min(1, "State/province is required").max(100),
  postalCode: z.string().trim().min(1, "Postal code is required").max(20),
  country: z.string().trim().min(1, "Country is required").max(100),
  phone: z.string().trim().min(5, "Enter a valid phone number").max(30),
});
export type AddressInput = z.infer<typeof addressSchema>;
