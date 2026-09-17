import { Router } from "express";
import { Role } from "../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";
import { EstimateController } from "./estimate.controller";
import { EstimateValidation } from "./estimate.validation";
import { auth } from "../../middlewares/checkAuth";

const router = Router();

router.post(
  "/",
  auth(Role.PROVIDER),
  validateRequest(
    EstimateValidation.CreateEstimateZodSchema,
  ),
  EstimateController.createEstimate,
);

router.get(
  "/provider",
  auth(Role.PROVIDER),
  EstimateController.getMyProviderEstimates,
);

router.get(
  "/customer",
  auth(Role.CUSTOMER),
  EstimateController.getMyCustomerEstimates,
);

router.get(
  "/:id",
  auth(Role.CUSTOMER, Role.PROVIDER),
  EstimateController.getEstimateById,
);

router.patch(
  "/:id",
  auth(Role.PROVIDER),
  validateRequest(
    EstimateValidation.UpdateEstimateZodSchema,
  ),
  EstimateController.updateEstimate,
);

router.patch(
  "/:id/approve",
  auth(Role.CUSTOMER),
  EstimateController.approveEstimate,
);

router.patch(
  "/:id/reject",
  auth(Role.CUSTOMER),
  EstimateController.rejectEstimate,
);

export const EstimateRoutes = router;