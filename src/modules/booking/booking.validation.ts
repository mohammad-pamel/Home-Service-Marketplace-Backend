import z from "zod";

const CreateBookingZodSchema = z.object({
  serviceRequestId: z.string().uuid("Invalid service request ID"),

  scheduledAt: z
    .string()
    .datetime("Invalid scheduled date and time"),
});

const UpdateBookingZodSchema = z.object({
  scheduledAt: z
    .string()
    .datetime("Invalid scheduled date and time")
    .optional(),
});

export const BookingValidation = {
  CreateBookingZodSchema,
  UpdateBookingZodSchema,
};