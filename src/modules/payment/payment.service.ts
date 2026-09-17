import {
  BookingStatus,
  PaymentMethod,
  PaymentProvider,
  PaymentStatus,
} from "../../generated/prisma/enums";
import config from "../../config";
import { executeBkashPayment, getBkashIdToken } from "../../lib/bkash";
import { prisma } from "../../lib/prisma";
import {
  ICreatePaymentPayload,
  IUpdatePaymentStatusPayload,
} from "./payment.interface";

const createPayment = async (
  userId: string,
  payload: ICreatePaymentPayload,
) => {
  const booking = await prisma.booking.findFirst({
    where: {
      id: payload.bookingId,
      customerId: userId,
    },
    include: {
      estimate: {
        include: {
          items: true,
        },
      },
      customer: {
        select: {
          id: true,
          email: true,
          phone: true,
        },
      },
      serviceRequest: {
        include: {
          service: true,
        },
      },
      payments: true,
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
    // throw new AppError(
    //   httpStatus.NOT_FOUND,
    //   "Booking not found",
    // );
  }

  if (booking.status === "CANCELLED") {
    throw new Error("Cannot make payment for a cancelled booking");
    // throw new AppError(
    //   httpStatus.BAD_REQUEST,
    //   "Cannot make payment for a cancelled booking",
    // );
  }

  if (booking.status === "COMPLETED") {
    throw new Error("Booking payment is already completed");
    // throw new AppError(
    //   httpStatus.BAD_REQUEST,
    //   "Booking payment is already completed",
    // );
  }

  if (!booking.estimate) {
    throw new Error("Estimate has not been created for this booking");
    // throw new AppError(
    //   httpStatus.BAD_REQUEST,
    //   "Estimate has not been created for this booking",
    // );
  }

  if (booking.estimate.status !== "APPROVED") {
    throw new Error("Estimate must be approved before payment");
    // throw new AppError(
    //   httpStatus.BAD_REQUEST,
    //   "Estimate must be approved before payment",
    // );
  }

  const existingSuccessfulPayment =
    booking.payments.find(
      (payment) =>
        payment.status === "SUCCESS",
    );

  if (existingSuccessfulPayment) {
     throw new Error("Payment has already been completed");
    // throw new AppError(
    //   httpStatus.BAD_REQUEST,
    //   "Payment has already been completed",
    // );
  }

  const existingPendingPayment =
    booking.payments.find(
      (payment) =>
        payment.status === "PENDING" &&
        payment.provider === "BKASH",
    );

  if (existingPendingPayment) {
     throw new Error("A pending bKash payment already exists for this booking");
    // throw new AppError(
    //   httpStatus.BAD_REQUEST,
    //   "A pending bKash payment already exists for this booking",
    // );
  }

  const amount = Number(booking.estimate.total);

  if (!amount || amount <= 0) {
     throw new Error("Invalid payment amount");
    // throw new AppError(
    //   httpStatus.BAD_REQUEST,
    //   "Invalid payment amount",
    // );
  }

  if (payload.provider !== "BKASH") {
     throw new Error("Currently only bKash payment is available");
    // throw new AppError(
    //   httpStatus.BAD_REQUEST,
    //   "Currently only bKash payment is available",
    // );
  }

  const bkashIdToken = await getBkashIdToken();

  // Use booking ID directly as merchant invoice number
  const merchantInvoiceNumber = booking.id;

  const payerReference =
    booking.customer.phone ||
    booking.customer.email ||
    userId;

  const callbackURL =
    `${config.bkash_callback_url}` +
    `/api/v1/payments/bkash/callback`;

  const response = await fetch(
    `${config.bkash_base_url}/tokenized/checkout/create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: bkashIdToken,
        "X-App-Key": config.bkash_app_key,
      },
      body: JSON.stringify({
        mode: "0011",
        payerReference,
        callbackURL,
        amount: amount.toFixed(2),
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber,
      }),
    },
  );

  const result = await response.json();

  if (!response.ok) {
     throw new Error("Bkash payment creation failed");
    // throw new AppError(
    //   httpStatus.BAD_GATEWAY,
    //   result?.statusMessage ||
    //     "Bkash payment creation failed",
    // );
  }

  if (
    result?.statusCode !== "0000" ||
    !result?.paymentID ||
    !result?.bkashURL
  ) {
     throw new Error("Invalid response from bKash");
    // throw new AppError(
    //   httpStatus.BAD_GATEWAY,
    //   result?.statusMessage ||
    //     "Invalid response from bKash",
    // );
  }

  const payment = await prisma.payment.create({
    data: {
      bookingId: booking.id,
      provider: "BKASH",
      method: payload.method,
      amount,
      status: "PENDING",

      merchantInvoiceNumber,
      bkashPaymentId: result.paymentID,
      payerReference,

      gatewayResponse: result,
    },
  });

  return {
    paymentId: payment.id,
    bookingId: booking.id,
    amount,
    currency: "BDT",
    provider: payment.provider,
    method: payment.method,
    status: payment.status,

    bkashPaymentId: result.paymentID,
    merchantInvoiceNumber,

    paymentUrl: result.bkashURL,
  };
};

const getMyPayments = async (userId: string) => {
  const payments = await prisma.payment.findMany({
    where: {
      booking: {
        customerId: userId,
      },
    },
    include: {
      booking: {
        include: {
          serviceRequest: {
            include: {
              service: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return payments;
};

const getPaymentById = async (
  userId: string,
  paymentId: string,
) => {
  const payment = await prisma.payment.findFirst({
    where: {
      id: paymentId,
      OR: [
        {
          booking: {
            customerId: userId,
          },
        },
        {
          booking: {
            providerId: userId,
          },
        },
      ],
    },
    include: {
      booking: {
        include: {
          customer: {
            omit: {
              password: true,
            },
          },
          provider: {
            omit: {
              password: true,
            },
          },
          serviceRequest: {
            include: {
              service: true,
              location: true,
            },
          },
        },
      },
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  return payment;
};

const updatePaymentStatus = async (
  paymentId: string,
  payload: IUpdatePaymentStatusPayload,
) => {
  const payment = await prisma.payment.findUnique({
    where: {
      id: paymentId,
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (payment.status === PaymentStatus.REFUNDED) {
    throw new Error(
      "Refunded payment status cannot be changed",
    );
  }

  if (payment.status === PaymentStatus.SUCCESS) {
    if (payload.status !== "REFUNDED") {
      throw new Error(
        "Successful payment can only be refunded",
      );
    }
  }

  const updatedPayment = await prisma.$transaction(
    async (tx) => {
      const updated = await tx.payment.update({
        where: {
          id: paymentId,
        },
        data: {
          status:
            payload.status as PaymentStatus,

          paidAt:
            payload.status === "SUCCESS"
              ? new Date()
              : undefined,
        },
        include: {
          booking: true,
        },
      });

      if (payload.status === "SUCCESS") {
        await tx.booking.update({
          where: {
            id: payment.bookingId,
          },
          data: {
            status: BookingStatus.CONFIRMED,
          },
        });
      }

      if (payload.status === "REFUNDED") {
        await tx.booking.update({
          where: {
            id: payment.bookingId,
          },
          data: {
            status: BookingStatus.CANCELLED,
          },
        });
      }

      return updated;
    },
  );

  return updatedPayment;
};

const handleBkashCallback = async (
  paymentID: string,
  status: string,
) => {
  if (!paymentID) {
    // throw new AppError(
    //   httpStatus.BAD_REQUEST,
    //   "bKash paymentID is required",
    // );
    throw new Error("bKash paymentID is required");
  }

  const payment = await prisma.payment.findFirst({
    where: {
      //  transactionId: paymentID,
      bkashPaymentId: paymentID,
      provider: "BKASH",
    },
    include: {
      booking: true,
    },
  });

  if (!payment) {
    // throw new AppError(
    //   httpStatus.NOT_FOUND,
    //   "Payment record not found",
    // );
    throw new Error("Payment record not found");
  }

  // Already successfully paid
  if (payment.status === "SUCCESS") {
    return {
      success: true,
      message: "Payment already completed",
      paymentId: payment.id,
      bookingId: payment.bookingId,
    };
  }

  // User cancelled from bKash
  if (status === "cancel") {
    await prisma.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        status: "CANCELLED",
      },
    });

    return {
      success: false,
      message: "Payment cancelled by customer",
      paymentId: payment.id,
      bookingId: payment.bookingId,
    };
  }

  // bKash callback status is failure
  if (status === "failure") {
    await prisma.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        status: "FAILED",
      },
    });

    return {
      success: false,
      message: "Payment failed",
      paymentId: payment.id,
      bookingId: payment.bookingId,
    };
  }

  // Execute payment
  const executedPayment = await executeBkashPayment(paymentID);

  // bKash successful response
  if (
    executedPayment?.statusCode === "0000" &&
    executedPayment?.transactionStatus === "Completed"
  ) {
    const trxID = executedPayment?.trxID;

    if (!trxID) {
      // throw new AppError(
      //   httpStatus.BAD_GATEWAY,
      //   "bKash transaction ID not found",
      // );
      throw new Error("bKash transaction ID not found");
    }

    const updatedPayment = await prisma.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        // transactionId: trxID,
        bkashTrxId: trxID,
        status: "SUCCESS",
        paidAt: new Date(),
        gatewayResponse: executedPayment,
      },
    });

    return {
      success: true,
      message: "Payment completed successfully",
      payment: updatedPayment,
    };
  }

  // Execution response indicates failure
  const failedPayment = await prisma.payment.update({
    where: {
      id: payment.id,
    },
    data: {
      status: "FAILED",
      gatewayResponse: executedPayment,
    },
  });

  return {
    success: false,
    message:
      executedPayment?.statusMessage || "Payment execution failed",
    payment: failedPayment,
  };
};

export const PaymentService = {
  createPayment,
  getMyPayments,
  getPaymentById,
  updatePaymentStatus,
  handleBkashCallback,
};


























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