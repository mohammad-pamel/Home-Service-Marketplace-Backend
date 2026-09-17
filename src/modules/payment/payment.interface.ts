export interface ICreatePaymentPayload {
  bookingId: string;
  provider: "STRIPE" | "BKASH" | "SSLCOMMERZ";
  method: "CARD" | "MOBILE_BANKING" | "ONLINE_PAYMENT";
}

export interface IUpdatePaymentStatusPayload {
  status: "SUCCESS" | "FAILED" | "CANCELLED" | "REFUNDED";
}