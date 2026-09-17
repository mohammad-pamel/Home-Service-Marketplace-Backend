// import {
//   BookingStatus,
//   ReviewStatus,
// } from "../../generated/prisma/enums";
// import { prisma } from "../../lib/prisma";
// import {
//   ICreateReviewPayload,
//   IUpdateReviewPayload,
//   IUpdateReviewStatusPayload,
// } from "./review.interface";

// const createReview = async (
//   userId: string,
//   payload: ICreateReviewPayload,
// ) => {
//   const booking = await prisma.booking.findFirst({
//     where: {
//       id: payload.bookingId,
//       customerId: userId,
//     },
//     include: {
//       review: true,
//     },
//   });

//   if (!booking) {
//     throw new Error(
//       "Booking not found or you don't have permission",
//     );
//   }

//   if (booking.status !== BookingStatus.COMPLETED) {
//     throw new Error(
//       "You can only review a completed booking",
//     );
//   }

//   if (booking.review) {
//     throw new Error(
//       "A review already exists for this booking",
//     );
//   }

//   const review = await prisma.$transaction(
//     async (tx) => {
//       const createdReview =
//         await tx.review.create({
//           data: {
//             customerId: userId,
//             providerId: booking.providerId,
//             bookingId: booking.id,
//             rating: payload.rating,
//             comment: payload.comment,
//             status: ReviewStatus.PUBLISHED,
//           },
//           include: {
//             customer: {
//               omit: {
//                 password: true,
//               },
//             },
//             provider: {
//               omit: {
//                 password: true,
//               },
//             },
//             booking: true,
//           },
//         });

//       const providerProfile =
//         await tx.serviceProviderProfile.findUnique({
//           where: {
//             userId: booking.providerId,
//           },
//         });

//       if (providerProfile) {
//         const oldTotalReviews =
//           providerProfile.totalReviews;

//         const oldRating =
//           providerProfile.rating;

//         const newTotalReviews =
//           oldTotalReviews + 1;

//         const newRating =
//           oldTotalReviews === 0
//             ? payload.rating
//             : (oldRating * oldTotalReviews +
//                 payload.rating) /
//               newTotalReviews;

//         await tx.serviceProviderProfile.update({
//           where: {
//             userId: booking.providerId,
//           },
//           data: {
//             rating: Number(
//               newRating.toFixed(2),
//             ),
//             totalReviews: newTotalReviews,
//           },
//         });
//       }

//       return createdReview;
//     },
//   );

//   return review;
// };

// const getMyReviews = async (
//   userId: string,
// ) => {
//   const reviews = await prisma.review.findMany({
//     where: {
//       customerId: userId,
//     },
//     include: {
//       provider: {
//         omit: {
//           password: true,
//         },
//       },
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

//   return reviews;
// };

// const getProviderReviews = async (
//   providerId: string,
// ) => {
//   const reviews = await prisma.review.findMany({
//     where: {
//       providerId,
//       status: ReviewStatus.PUBLISHED,
//     },
//     include: {
//       customer: {
//         omit: {
//           password: true,
//         },
//       },
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

//   return reviews;
// };

// const getReviewById = async (
//   userId: string,
//   reviewId: string,
// ) => {
//   const review = await prisma.review.findFirst({
//     where: {
//       id: reviewId,
//       OR: [
//         {
//           customerId: userId,
//         },
//         {
//           providerId: userId,
//         },
//       ],
//     },
//     include: {
//       customer: {
//         omit: {
//           password: true,
//         },
//       },
//       provider: {
//         omit: {
//           password: true,
//         },
//       },
//       booking: {
//         include: {
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

//   if (!review) {
//     throw new Error("Review not found");
//   }

//   return review;
// };

// const updateReview = async (
//   userId: string,
//   reviewId: string,
//   payload: IUpdateReviewPayload,
// ) => {
//   const existingReview =
//     await prisma.review.findFirst({
//       where: {
//         id: reviewId,
//         customerId: userId,
//       },
//     });

//   if (!existingReview) {
//     throw new Error(
//       "Review not found or you don't have permission",
//     );
//   }

//   if (existingReview.status === ReviewStatus.HIDDEN) {
//     throw new Error(
//       "Hidden review cannot be updated",
//     );
//   }

//   const updatedReview =
//     await prisma.$transaction(
//       async (tx) => {
//         const updated =
//           await tx.review.update({
//             where: {
//               id: reviewId,
//             },
//             data: {
//               rating: payload.rating,
//               comment: payload.comment,
//             },
//           });

//         if (
//           payload.rating !== undefined &&
//           payload.rating !== existingReview.rating
//         ) {
//           const providerProfile =
//             await tx.serviceProviderProfile.findUnique(
//               {
//                 where: {
//                   userId:
//                     existingReview.providerId,
//                 },
//               },
//             );

//           if (providerProfile) {
//             const newRating =
//               (
//                 providerProfile.rating *
//                   providerProfile.totalReviews -
//                 existingReview.rating +
//                 payload.rating
//               ) /
//               providerProfile.totalReviews;

//             await tx.serviceProviderProfile.update({
//               where: {
//                 userId:
//                   existingReview.providerId,
//               },
//               data: {
//                 rating: Number(
//                   newRating.toFixed(2),
//                 ),
//               },
//             });
//           }
//         }

//         return updated;
//       },
//     );

//   return updatedReview;
// };

// const deleteReview = async (
//   userId: string,
//   reviewId: string,
// ) => {
//   const existingReview =
//     await prisma.review.findFirst({
//       where: {
//         id: reviewId,
//         customerId: userId,
//       },
//     });

//   if (!existingReview) {
//     throw new Error(
//       "Review not found or you don't have permission",
//     );
//   }

//   await prisma.$transaction(
//     async (tx) => {
//       const providerProfile =
//         await tx.serviceProviderProfile.findUnique({
//           where: {
//             userId:
//               existingReview.providerId,
//           },
//         });

//       await tx.review.delete({
//         where: {
//           id: reviewId,
//         },
//       });

//       if (
//         providerProfile &&
//         providerProfile.totalReviews > 0
//       ) {
//         const newTotalReviews =
//           providerProfile.totalReviews - 1;

//         const newRating =
//           newTotalReviews === 0
//             ? 0
//             : (
//                 providerProfile.rating *
//                   providerProfile.totalReviews -
//                 existingReview.rating
//               ) /
//               newTotalReviews;

//         await tx.serviceProviderProfile.update({
//           where: {
//             userId:
//               existingReview.providerId,
//           },
//           data: {
//             rating: Number(
//               newRating.toFixed(2),
//             ),
//             totalReviews: newTotalReviews,
//           },
//         });
//       }
//     },
//   );

//   return null;
// };

// const updateReviewStatus = async (
//   reviewId: string,
//   payload: IUpdateReviewStatusPayload,
// ) => {
//   const review = await prisma.review.findUnique({
//     where: {
//       id: reviewId,
//     },
//   });

//   if (!review) {
//     throw new Error("Review not found");
//   }

//   const updatedReview =
//     await prisma.review.update({
//       where: {
//         id: reviewId,
//       },
//       data: {
//         status:
//           payload.status as ReviewStatus,
//       },
//     });

//   return updatedReview;
// };

// export const ReviewService = {
//   createReview,
//   getMyReviews,
//   getProviderReviews,
//   getReviewById,
//   updateReview,
//   deleteReview,
//   updateReviewStatus,
// };