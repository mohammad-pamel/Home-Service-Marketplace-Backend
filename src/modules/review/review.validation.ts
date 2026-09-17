import z from "zod";

const CreateReviewZodSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID"),

  rating: z
    .number()
    .int("Rating must be an integer")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),

  comment: z
    .string()
    .max(2000, "Comment cannot exceed 2000 characters")
    .optional(),
});

const UpdateReviewZodSchema = z.object({
  rating: z
    .number()
    .int("Rating must be an integer")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5")
    .optional(),

  comment: z
    .string()
    .max(2000, "Comment cannot exceed 2000 characters")
    .optional(),
});

const UpdateReviewStatusZodSchema = z.object({
  status: z.enum(
    ["PUBLISHED", "HIDDEN"],
    "Invalid review status",
  ),
});

export const ReviewValidation = {
  CreateReviewZodSchema,
  UpdateReviewZodSchema,
  UpdateReviewStatusZodSchema,
};