import z from "zod";

const CreateWorkLogZodSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID"),

  title: z
    .string()
    .min(3, "Title must be at least 3 characters long")
    .max(200, "Title cannot exceed 200 characters"),

  description: z
    .string()
    .max(2000, "Description cannot exceed 2000 characters")
    .optional(),

  startedAt: z
    .string()
    .datetime("Invalid started date")
    .optional(),
});

const UpdateWorkLogZodSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters long")
    .max(200, "Title cannot exceed 200 characters")
    .optional(),

  description: z
    .string()
    .max(2000, "Description cannot exceed 2000 characters")
    .optional(),

  startedAt: z
    .string()
    .datetime("Invalid started date")
    .optional(),
});

export const WorkLogValidation = {
  CreateWorkLogZodSchema,
  UpdateWorkLogZodSchema,
};