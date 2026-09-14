import z from "zod";

const CreateProviderServiceZodSchema = z.object({
  serviceId: z
    .string()
    .uuid("Invalid service ID"),

  price: z
    .number()
    .positive("Price must be greater than 0")
    .optional(),
});

const UpdateProviderServiceZodSchema = z.object({
  price: z
    .number()
    .positive("Price must be greater than 0")
    .optional(),
});

export const ProviderServiceValidation = {
  CreateProviderServiceZodSchema,
  UpdateProviderServiceZodSchema,
};