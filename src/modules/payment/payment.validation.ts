import z from "zod";

const CreatePaymentZodSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID"),

  provider: z.enum(
    ["STRIPE", "BKASH", "SSLCOMMERZ"],
    "Invalid payment provider",
  ),

  method: z.enum(
    ["CARD", "MOBILE_BANKING", "ONLINE_PAYMENT"],
    "Invalid payment method",
  ),
});

const UpdatePaymentStatusZodSchema = z.object({
  status: z.enum(
    ["SUCCESS", "FAILED", "CANCELLED", "REFUNDED"],
    "Invalid payment status",
  ),
});

export const PaymentValidation = {
  CreatePaymentZodSchema,
  UpdatePaymentStatusZodSchema,
};