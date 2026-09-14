import { Router } from "express";
import { Role } from "../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";
import { ProviderController } from "./provider.controller";
import { ProviderValidation } from "./provider.validation";
import { auth } from "../../middlewares/checkAuth";

const router = Router();

// Create provider profile
router.post(
  "/profile",
  auth(Role.PROVIDER),
  validateRequest(
    ProviderValidation.CreateProviderProfileZodSchema,
  ),
  ProviderController.createProviderProfile,
);

// Get my provider profile
router.get(
  "/profile",
  auth(Role.PROVIDER),
  ProviderController.getMyProviderProfile,
);

// Update my provider profile
router.patch(
  "/profile",
  auth(Role.PROVIDER),
  validateRequest(
    ProviderValidation.UpdateProviderProfileZodSchema,
  ),
  ProviderController.updateMyProviderProfile,
);

// Public: Get all providers
router.get(
  "/",
  ProviderController.getAllProviders,
);

// Public: Get provider by ID
router.get(
  "/:id",
  ProviderController.getProviderById,
);

export const ProviderRoutes = router;