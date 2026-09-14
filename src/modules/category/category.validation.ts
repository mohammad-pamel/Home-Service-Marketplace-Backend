import z from "zod";

const CreateCategoryZodSchema = z.object({
  name: z
    .string("Name must be a string")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),

  slug: z
    .string("Slug must be a string")
    .min(2, "Slug must be at least 2 characters")
    .max(120, "Slug cannot exceed 120 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers and hyphens",
    ),

  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),

  image: z
    .string()
    .url("Invalid image URL")
    .optional(),
});

const UpdateCategoryZodSchema =
  CreateCategoryZodSchema.partial().extend({
    isActive: z.boolean().optional(),
  });

export const CategoryValidation = {
  CreateCategoryZodSchema,
  UpdateCategoryZodSchema,
};
