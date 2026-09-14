import z from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const CreateAvailabilityZodSchema = z.object({
  dayOfWeek: z
    .number()
    .int("Day of week must be an integer")
    .min(0, "Day of week must be between 0 and 6")
    .max(6, "Day of week must be between 0 and 6"),

  startTime: z
    .string()
    .regex(
      timeRegex,
      "Start time must be in HH:mm format",
    ),

  endTime: z
    .string()
    .regex(
      timeRegex,
      "End time must be in HH:mm format",
    ),

  isAvailable: z.boolean().optional(),
});

const UpdateAvailabilityZodSchema =
  CreateAvailabilityZodSchema.partial();

export const AvailabilityValidation = {
  CreateAvailabilityZodSchema,
  UpdateAvailabilityZodSchema,
};