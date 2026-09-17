import { Router } from "express";
import { Role } from "../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";
import { ReviewController } from "./review.controller";
import { ReviewValidation } from "./review.validation";
import { auth } from "../../middlewares/checkAuth";

const router = Router();

router.post(
  "/",
  auth(Role.CUSTOMER),
  validateRequest(
    ReviewValidation.CreateReviewZodSchema,
  ),
  ReviewController.createReview,
);

router.get(
  "/my-reviews",
  auth(Role.CUSTOMER),
  ReviewController.getMyReviews,
);

router.get(
  "/provider/:providerId",
  ReviewController.getProviderReviews,
);

router.get(
  "/:id",
  auth(Role.CUSTOMER, Role.PROVIDER),
  ReviewController.getReviewById,
);

router.patch(
  "/:id",
  auth(Role.CUSTOMER),
  validateRequest(
    ReviewValidation.UpdateReviewZodSchema,
  ),
  ReviewController.updateReview,
);

router.delete(
  "/:id",
  auth(Role.CUSTOMER),
  ReviewController.deleteReview,
);

router.patch(
  "/:id/status",
  auth(Role.ADMIN),
  validateRequest(
    ReviewValidation.UpdateReviewStatusZodSchema,
  ),
  ReviewController.updateReviewStatus,
);

export const ReviewRoutes = router;