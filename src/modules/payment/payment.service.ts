// import {
//   BookingStatus,
//   PaymentMethod,
//   PaymentProvider,
//   PaymentStatus,
// } from "../../generated/prisma/enums";
// import { prisma } from "../../lib/prisma";
// import {
//   ICreatePaymentPayload,
//   IUpdatePaymentStatusPayload,
// } from "./payment.interface";

// const createPayment = async (
//   userId: string,
//   payload: ICreatePaymentPayload,
// ) => {
//   const booking = await prisma.booking.findFirst({
//     where: {
//       id: payload.bookingId,
//       customerId: userId,
//     },
//     include: {
//       estimate: true,
//       payments: true,
//       serviceRequest: {
//         include: {
//           service: true,
//         },
//       },
//     },
//   });

//   if (!booking) {
//     throw new Error(
//       "Booking not found or you don't have permission",
//     );
//   }

//   if (booking.status === BookingStatus.CANCELLED) {
//     throw new Error(
//       "Cannot make payment for a cancelled booking",
//     );
//   }

//   if (booking.status === BookingStatus.COMPLETED) {
//     throw new Error(
//       "This booking has already been completed",
//     );
//   }

//   if (!booking.estimate) {
//     throw new Error(
//       "Estimate not found for this booking",
//     );
//   }

//   if (booking.estimate.status !== "APPROVED") {
//     throw new Error(
//       "Estimate must be approved before making payment",
//     );
//   }

//   const existingSuccessfulPayment =
//     booking.payments.find(
//       (payment) =>
//         payment.status === PaymentStatus.SUCCESS,
//     );

//   if (existingSuccessfulPayment) {
//     throw new Error(
//       "Payment has already been completed for this booking",
//     );
//   }

//   const existingPendingPayment =
//     booking.payments.find(
//       (payment) =>
//         payment.status === PaymentStatus.PENDING,
//     );

//   if (existingPendingPayment) {
//     throw new Error(
//       "A pending payment already exists for this booking",
//     );
//   }

//   const payment = await prisma.payment.create({
//     data: {
//       bookingId: booking.id,
//       transactionId: `TXN-${Date.now()}-${Math.random()
//         .toString(36)
//         .substring(2, 8)
//         .toUpperCase()}`,
//       provider:
//         payload.provider as PaymentProvider,
//       method:
//         payload.method as PaymentMethod,
//       amount: booking.estimate.total,
//       status: PaymentStatus.PENDING,
//     },
//     include: {
//       booking: {
//         include: {
//           serviceRequest: {
//             include: {
//               service: true,
//             },
//           },
//           customer: {
//             omit: {
//               password: true,
//             },
//           },
//           provider: {
//             omit: {
//               password: true,
//             },
//           },
//         },
//       },
//     },
//   });

//   return payment;
// };

// const getMyPayments = async (userId: string) => {
//   const payments = await prisma.payment.findMany({
//     where: {
//       booking: {
//         customerId: userId,
//       },
//     },
//     include: {
//       booking: {
//         include: {
//           serviceRequest: {
//             include: {
//               service: true,
//             },
//           },
//         },
//       },
//     },
//     orderBy: {
//       createdAt: "desc",
//     },
//   });

//   return payments;
// };

// const getPaymentById = async (
//   userId: string,
//   paymentId: string,
// ) => {
//   const payment = await prisma.payment.findFirst({
//     where: {
//       id: paymentId,
//       OR: [
//         {
//           booking: {
//             customerId: userId,
//           },
//         },
//         {
//           booking: {
//             providerId: userId,
//           },
//         },
//       ],
//     },
//     include: {
//       booking: {
//         include: {
//           customer: {
//             omit: {
//               password: true,
//             },
//           },
//           provider: {
//             omit: {
//               password: true,
//             },
//           },
//           serviceRequest: {
//             include: {
//               service: true,
//               location: true,
//             },
//           },
//         },
//       },
//     },
//   });

//   if (!payment) {
//     throw new Error("Payment not found");
//   }

//   return payment;
// };

// const updatePaymentStatus = async (
//   paymentId: string,
//   payload: IUpdatePaymentStatusPayload,
// ) => {
//   const payment = await prisma.payment.findUnique({
//     where: {
//       id: paymentId,
//     },
//   });

//   if (!payment) {
//     throw new Error("Payment not found");
//   }

//   if (payment.status === PaymentStatus.REFUNDED) {
//     throw new Error(
//       "Refunded payment status cannot be changed",
//     );
//   }

//   if (payment.status === PaymentStatus.SUCCESS) {
//     if (payload.status !== "REFUNDED") {
//       throw new Error(
//         "Successful payment can only be refunded",
//       );
//     }
//   }

//   const updatedPayment =
//     await prisma.$transaction(async (tx) => {
//       const updated =
//         await tx.payment.update({
//           where: {
//             id: paymentId,
//           },
//           data: {
//             status:
//               payload.status as PaymentStatus,

//             paidAt:
//               payload.status === "SUCCESS"
//                 ? new Date()
//                 : undefined,
//           },
//           include: {
//             booking: true,
//           },
//         });

//       if (
//         payload.status === "SUCCESS"
//       ) {
//         await tx.booking.update({
//           where: {
//             id: payment.bookingId,
//           },
//           data: {
//             status: BookingStatus.CONFIRMED,
//           },
//         });
//       }

//       if (
//         payload.status === "REFUNDED"
//       ) {
//         await tx.booking.update({
//           where: {
//             id: payment.bookingId,
//           },
//           data: {
//             status: BookingStatus.CANCELLED,
//           },
//         });
//       }

//       return updated;
//     });

//   return updatedPayment;
// };

// export const PaymentService = {
//   createPayment,
//   getMyPayments,
//   getPaymentById,
//   updatePaymentStatus,
// };