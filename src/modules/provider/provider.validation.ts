import z from "zod";

const CreateProviderProfileZodSchema = z.object({
  bio: z
    .string()
    .max(1000, "Bio cannot exceed 1000 characters")
    .optional(),

  experienceYears: z
    .number()
    .int("Experience years must be an integer")
    .min(0, "Experience years cannot be negative")
    .max(50, "Experience years cannot exceed 50")
    .optional(),

  serviceArea: z
    .string()
    .max(255, "Service area cannot exceed 255 characters")
    .optional(),

  latitude: z
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90")
    .optional(),

  longitude: z
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180")
    .optional(),
});

const UpdateProviderProfileZodSchema =
  CreateProviderProfileZodSchema.partial();

export const ProviderValidation = {
  CreateProviderProfileZodSchema,
  UpdateProviderProfileZodSchema,
};