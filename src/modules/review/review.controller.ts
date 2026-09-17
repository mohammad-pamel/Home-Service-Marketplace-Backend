// import { catchAsync } from "../../utils/catchAsync";
// import { sendResponse } from "../../utils/sendResponse";
// import { ReviewService } from "./review.service";

// const createReview = catchAsync(
//   async (req, res) => {
//     const userId = req.user!.userId;

//     const result =
//       await ReviewService.createReview(
//         userId,
//         req.body,
//       );

//     sendResponse(res, {
//       statusCode: 201,
//       success: true,
//       message: "Review created successfully",
//       data: result,
//     });
//   },
// );

// const getMyReviews = catchAsync(
//   async (req, res) => {
//     const userId = req.user!.userId;

//     const result =
//       await ReviewService.getMyReviews(
//         userId,
//       );

//     sendResponse(res, {
//       statusCode: 200,
//       success: true,
//       message: "Reviews retrieved successfully",
//       data: result,
//     });
//   },
// );

// const getProviderReviews = catchAsync(
//   async (req, res) => {
//     const providerId =
//       req.params.providerId as string;

//     const result =
//       await ReviewService.getProviderReviews(
//         providerId,
//       );

//     sendResponse(res, {
//       statusCode: 200,
//       success: true,
//       message: "Provider reviews retrieved successfully",
//       data: result,
//     });
//   },
// );

// const getReviewById = catchAsync(
//   async (req, res) => {
//     const userId = req.user!.userId;

//     const reviewId =
//       req.params.id as string;

//     const result =
//       await ReviewService.getReviewById(
//         userId,
//         reviewId,
//       );

//     sendResponse(res, {
//       statusCode: 200,
//       success: true,
//       message: "Review retrieved successfully",
//       data: result,
//     });
//   },
// );

// const updateReview = catchAsync(
//   async (req, res) => {
//     const userId = req.user!.userId;

//     const reviewId =
//       req.params.id as string;

//     const result =
//       await ReviewService.updateReview(
//         userId,
//         reviewId,
//         req.body,
//       );

//     sendResponse(res, {
//       statusCode: 200,
//       success: true,
//       message: "Review updated successfully",
//       data: result,
//     });
//   },
// );

// const deleteReview = catchAsync(
//   async (req, res) => {
//     const userId = req.user!.userId;

//     const reviewId =
//       req.params.id as string;

//     await ReviewService.deleteReview(
//       userId,
//       reviewId,
//     );

//     sendResponse(res, {
//       statusCode: 200,
//       success: true,
//       message: "Review deleted successfully",
//       data: null,
//     });
//   },
// );

// const updateReviewStatus = catchAsync(
//   async (req, res) => {
//     const reviewId =
//       req.params.id as string;

//     const result =
//       await ReviewService.updateReviewStatus(
//         reviewId,
//         req.body,
//       );

//     sendResponse(res, {
//       statusCode: 200,
//       success: true,
//       message: "Review status updated successfully",
//       data: result,
//     });
//   },
// );

// export const ReviewController = {
//   createReview,
//   getMyReviews,
//   getProviderReviews,
//   getReviewById,
//   updateReview,
//   deleteReview,
//   updateReviewStatus,
// };