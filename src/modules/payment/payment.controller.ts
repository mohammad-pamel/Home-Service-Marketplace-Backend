import config from "../../config";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { IBkashCallbackQuery } from "./payment.interface";
import { PaymentService } from "./payment.service";

const createPayment = catchAsync(
  async (req, res) => {
    const userId = req.user!.userId;

    const result =
      await PaymentService.createPayment(
        userId,
        req.body,
      );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Payment created successfully",
      data: result,
    });
  },
);

const getMyPayments = catchAsync(
  async (req, res) => {
    const userId = req.user!.userId;

    const result =
      await PaymentService.getMyPayments(
        userId,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Payments retrieved successfully",
      data: result,
    });
  },
);


// Get My Provider Payments
const getMyProviderPayments = catchAsync(async (req, res) => {
  const userId = req.user!.userId;

  const result = await PaymentService.getMyProviderPayments(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Provider payments retrieved successfully",
    data: result,
  });
});

const getAllPayments = catchAsync(async (req, res) => {
  const result = await PaymentService.getAllPayments();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All payments retrieved successfully",
    data: result,
  });
});

const getPaymentById = catchAsync(
  async (req, res) => {
    const userId = req.user!.userId;

    const paymentId =
      req.params.id as string;

    const result =
      await PaymentService.getPaymentById(
        userId,
        paymentId,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Payment retrieved successfully",
      data: result,
    });
  },
);

const updatePaymentStatus = catchAsync(
  async (req, res) => {
    const paymentId =
      req.params.id as string;

    const result =
      await PaymentService.updatePaymentStatus(
        paymentId,
        req.body,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Payment status updated successfully",
      data: result,
    });
  },
);

// const bkashCallback = catchAsync(
//   async (req, res) => {
//     const { paymentID, status } =
//       req.query as IBkashCallbackQuery;

//     const result =
//       await PaymentService.handleBkashCallback(
//         paymentID as string,
//         status as string,
//       );

//     if (result.success) {
//       // return res.status(httpStatus.OK).json({
//       //   success: true,
//       //   message: result.message,
//       //   data: result,
//       // });

//       sendResponse(res, {
//         statusCode: 200,
//         success: true,
//         message: result.message,
//         data: result,
//       });
//     }

//     // return res.status(httpStatus.OK).json({
//     //   success: false,
//     //   message: result.message,
//     //   data: result,
//     // });

//     sendResponse(res, {
//       statusCode: 500,
//       success: true,
//       message: result.message,
//       data: result,
//     });

//   },
// );



const bkashCallback = catchAsync(async (req, res) => {
  const { paymentID, status } = req.query as IBkashCallbackQuery;

  const result = await PaymentService.handleBkashCallback(
    paymentID as string,
    status as string
  );

  const frontendUrl = config.frontend_url || "http://localhost:3000";

  const payment = result.payment;

  let redirectPath = "/customer/payments/failed";

  if (result.success) {
    redirectPath = "/customer/payments/success";
  } else if (status === "cancel") {
    redirectPath = "/customer/payments/cancel";
  }

  const redirectUrl = new URL(redirectPath, frontendUrl);

  if (payment) {
    redirectUrl.searchParams.set("paymentId", payment.id);
    redirectUrl.searchParams.set("bookingId", payment.bookingId);

    if (payment.bkashTrxId) {
      redirectUrl.searchParams.set("trxId", payment.bkashTrxId);
    }

    redirectUrl.searchParams.set("amount", String(payment.amount));

    if (payment.paidAt) {
      redirectUrl.searchParams.set(
        "paidAt",
        payment.paidAt.toISOString()
      );
    }
  } else {
    // Handles an already completed payment response.
    if ("paymentId" in result && result.paymentId) {
      redirectUrl.searchParams.set("paymentId", result.paymentId as string);
    }

    if ("bookingId" in result && result.bookingId) {
      redirectUrl.searchParams.set("bookingId", result.bookingId as string);
    }
  }

  return res.redirect(302, redirectUrl.toString());
});



export const PaymentController = {
  createPayment,
  getMyPayments,
  getMyProviderPayments,
  getAllPayments,
  getPaymentById,
  updatePaymentStatus,
  bkashCallback
};