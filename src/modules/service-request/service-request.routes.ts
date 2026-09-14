import { Router } from "express";
import { Role } from "../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";
import { ServiceRequestController } from "./service-request.controller";
import { ServiceRequestValidation } from "./service-request.validation";
import { auth } from "../../middlewares/checkAuth";

const router = Router();

router.post(
  "/",
  auth(Role.CUSTOMER),
  validateRequest(
    ServiceRequestValidation.CreateServiceRequestZodSchema,
  ),
  ServiceRequestController.createServiceRequest,
);

router.get(
  "/my-requests",
  auth(Role.CUSTOMER),
  ServiceRequestController.getMyServiceRequests,
);

router.get(
  "/:id",
  auth(Role.CUSTOMER),
  ServiceRequestController.getServiceRequestById,
);

router.patch(
  "/:id",
  auth(Role.CUSTOMER),
  validateRequest(
    ServiceRequestValidation.UpdateServiceRequestZodSchema,
  ),
  ServiceRequestController.updateServiceRequest,
);

router.patch(
  "/:id/cancel",
  auth(Role.CUSTOMER),
  ServiceRequestController.cancelServiceRequest,
);

export const ServiceRequestRoutes = router;