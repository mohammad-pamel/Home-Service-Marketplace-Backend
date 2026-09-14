import z from "zod";

const CreateServiceZodSchema = z.object({
  categoryId: z
    .string()
    .min(1, "Category ID is required"),

  name: z
    .string("Name must be a string")
    .min(2, "Name must be at least 2 characters")
    .max(150, "Name cannot exceed 150 characters"),

  slug: z
    .string("Slug must be a string")
    .min(2, "Slug must be at least 2 characters")
    .max(150, "Slug cannot exceed 150 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers and hyphens",
    ),

  description: z
    .string()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional(),

  basePrice: z
    .number()
    .positive("Base price must be greater than 0"),

  durationMinutes: z
    .number()
    .int("Duration must be a whole number")
    .positive("Duration must be greater than 0"),
});

const UpdateServiceZodSchema =
  CreateServiceZodSchema.partial().extend({
    isActive: z.boolean().optional(),
  });

const ServiceQueryZodSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .positive()
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(10),

  search: z.string().optional(),

  status: z
    .enum(["active", "inactive"])
    .optional(),

  sortBy: z
    .enum([
      "createdAt",
      "name",
      "basePrice",
      "durationMinutes",
    ])
    .default("createdAt"),

  sortOrder: z
    .enum(["asc", "desc"])
    .default("desc"),
});

export const ServiceValidation = {
  CreateServiceZodSchema,
  UpdateServiceZodSchema,
  ServiceQueryZodSchema,
};
