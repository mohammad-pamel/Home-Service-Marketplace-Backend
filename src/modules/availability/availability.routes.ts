import { Router } from "express";
import { Role } from "../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";
import { AvailabilityController } from "./availability.controller";
import { AvailabilityValidation } from "./availability.validation";
import { auth } from "../../middlewares/checkAuth";

const router = Router();

// Provider creates availability
router.post(
  "/",
  auth(Role.PROVIDER),
  validateRequest(
    AvailabilityValidation.CreateAvailabilityZodSchema,
  ),
  AvailabilityController.createAvailability,
);

// Provider gets own availability
router.get(
  "/my-availability",
  auth(Role.PROVIDER),
  AvailabilityController.getMyAvailability,
);

// Provider updates availability
router.patch(
  "/:id",
  auth(Role.PROVIDER),
  validateRequest(
    AvailabilityValidation.UpdateAvailabilityZodSchema,
  ),
  AvailabilityController.updateAvailability,
);

// Provider deletes availability
router.delete(
  "/:id",
  auth(Role.PROVIDER),
  AvailabilityController.deleteAvailability,
);

// Public provider availability
router.get(
  "/provider/:providerId",
  AvailabilityController.getProviderAvailability,
);

export const AvailabilityRoutes = router;