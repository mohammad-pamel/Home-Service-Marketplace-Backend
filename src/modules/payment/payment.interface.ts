// export interface ICreatePaymentPayload {
//   bookingId: string;
//   provider: "STRIPE" | "BKASH" | "SSLCOMMERZ";
//   method: "CARD" | "MOBILE_BANKING" | "ONLINE_PAYMENT";
// }

// export interface IUpdatePaymentStatusPayload {
//   status: "SUCCESS" | "FAILED" | "CANCELLED" | "REFUNDED";
// }

export interface ICreatePaymentPayload {
  bookingId: string;
  provider: "STRIPE" | "BKASH" | "SSLCOMMERZ";
  method: "CARD" | "MOBILE_BANKING" | "ONLINE_PAYMENT";
}

export interface IUpdatePaymentStatusPayload {
  status: "SUCCESS" | "FAILED" | "CANCELLED" | "REFUNDED";
}

export interface IBkashCallbackQuery {
  paymentID?: string;
  status?: string;
}
















// model Payment {
//   id String @id @default(uuid())

//   bookingId String
//   booking   Booking @relation(fields: [bookingId], references: [id])

//   transactionId String @unique

//   provider PaymentProvider
//   method   PaymentMethod

//   amount Decimal @db.Decimal(12, 2)

//   status PaymentStatus @default(PENDING)

//   gatewayResponse Json?

//   paidAt DateTime?

//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt

//   @@index([bookingId])
//   @@index([status])
//   @@index([provider])
//   @@index([createdAt])
// }
