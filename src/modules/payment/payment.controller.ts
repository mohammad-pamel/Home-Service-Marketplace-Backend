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

const bkashCallback = catchAsync(
  async (req, res) => {
    const { paymentID, status } =
      req.query as IBkashCallbackQuery;

    const result =
      await PaymentService.handleBkashCallback(
        paymentID as string,
        status as string,
      );

    if (result.success) {
      // return res.status(httpStatus.OK).json({
      //   success: true,
      //   message: result.message,
      //   data: result,
      // });

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: result.message,
        data: result,
      });
    }

    // return res.status(httpStatus.OK).json({
    //   success: false,
    //   message: result.message,
    //   data: result,
    // });

    sendResponse(res, {
      statusCode: 500,
      success: true,
      message: result.message,
      data: result,
    });

  },
);

export const PaymentController = {
  createPayment,
  getMyPayments,
  getMyProviderPayments,
  getAllPayments,
  getPaymentById,
  updatePaymentStatus,
  bkashCallback
};