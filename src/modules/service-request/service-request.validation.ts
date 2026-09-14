import z from "zod";

const CreateServiceRequestZodSchema = z.object({
  serviceId: z.string().uuid("Invalid service ID"),

  title: z
    .string()
    .min(3, "Title must be at least 3 characters long")
    .max(200, "Title cannot exceed 200 characters"),

  description: z
    .string()
    .min(10, "Description must be at least 10 characters long")
    .max(2000, "Description cannot exceed 2000 characters"),

  address: z
    .string()
    .min(5, "Address must be at least 5 characters long")
    .max(500, "Address cannot exceed 500 characters"),

  city: z.string().max(100).optional(),

  area: z.string().max(100).optional(),

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

  preferredDate: z
    .string()
    .datetime("Invalid preferred date")
    .optional(),

  preferredTime: z
    .string()
    .max(50, "Preferred time is too long")
    .optional(),
});

const UpdateServiceRequestZodSchema = z.object({
  title: z
    .string()
    .min(3)
    .max(200)
    .optional(),

  description: z
    .string()
    .min(10)
    .max(2000)
    .optional(),

  address: z
    .string()
    .min(5)
    .max(500)
    .optional(),

  city: z.string().max(100).optional(),

  area: z.string().max(100).optional(),

  latitude: z
    .number()
    .min(-90)
    .max(90)
    .optional(),

  longitude: z
    .number()
    .min(-180)
    .max(180)
    .optional(),

  preferredDate: z
    .string()
    .datetime("Invalid preferred date")
    .optional(),

  preferredTime: z
    .string()
    .max(50)
    .optional(),
});

export const ServiceRequestValidation = {
  CreateServiceRequestZodSchema,
  UpdateServiceRequestZodSchema,
};