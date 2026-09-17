import z from "zod";

const EstimateItemSchema = z.object({
  description: z
    .string()
    .min(2, "Description must be at least 2 characters")
    .max(500, "Description cannot exceed 500 characters"),

  quantity: z
    .number()
    .positive("Quantity must be greater than 0"),

  unitPrice: z
    .number()
    .positive("Unit price must be greater than 0"),
});

const CreateEstimateZodSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID"),

  tax: z
    .number()
    .min(0, "Tax cannot be negative")
    .optional(),

  discount: z
    .number()
    .min(0, "Discount cannot be negative")
    .optional(),

  notes: z
    .string()
    .max(1000, "Notes cannot exceed 1000 characters")
    .optional(),

  expiresAt: z
    .string()
    .datetime("Invalid expiration date")
    .optional(),

  items: z
    .array(EstimateItemSchema)
    .min(1, "At least one estimate item is required"),
});

const UpdateEstimateZodSchema = z.object({
  tax: z
    .number()
    .min(0)
    .optional(),

  discount: z
    .number()
    .min(0)
    .optional(),

  notes: z
    .string()
    .max(1000)
    .optional(),

  expiresAt: z
    .string()
    .datetime()
    .optional(),

  items: z
    .array(EstimateItemSchema)
    .min(1)
    .optional(),
});

export const EstimateValidation = {
  CreateEstimateZodSchema,
  UpdateEstimateZodSchema,
};