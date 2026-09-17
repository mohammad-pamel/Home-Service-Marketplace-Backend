// import { catchAsync } from "../../utils/catchAsync";
// import { sendResponse } from "../../utils/sendResponse";
// import { PaymentService } from "./payment.service";

// const createPayment = catchAsync(
//   async (req, res) => {
//     const userId = req.user!.userId;

//     const result =
//       await PaymentService.createPayment(
//         userId,
//         req.body,
//       );

//     sendResponse(res, {
//       statusCode: 201,
//       success: true,
//       message: "Payment created successfully",
//       data: result,
//     });
//   },
// );

// const getMyPayments = catchAsync(
//   async (req, res) => {
//     const userId = req.user!.userId;

//     const result =
//       await PaymentService.getMyPayments(
//         userId,
//       );

//     sendResponse(res, {
//       statusCode: 200,
//       success: true,
//       message: "Payments retrieved successfully",
//       data: result,
//     });
//   },
// );

// const getPaymentById = catchAsync(
//   async (req, res) => {
//     const userId = req.user!.userId;

//     const paymentId =
//       req.params.id as string;

//     const result =
//       await PaymentService.getPaymentById(
//         userId,
//         paymentId,
//       );

//     sendResponse(res, {
//       statusCode: 200,
//       success: true,
//       message: "Payment retrieved successfully",
//       data: result,
//     });
//   },
// );

// const updatePaymentStatus = catchAsync(
//   async (req, res) => {
//     const paymentId =
//       req.params.id as string;

//     const result =
//       await PaymentService.updatePaymentStatus(
//         paymentId,
//         req.body,
//       );

//     sendResponse(res, {
//       statusCode: 200,
//       success: true,
//       message: "Payment status updated successfully",
//       data: result,
//     });
//   },
// );

// export const PaymentController = {
//   createPayment,
//   getMyPayments,
//   getPaymentById,
//   updatePaymentStatus,
// };