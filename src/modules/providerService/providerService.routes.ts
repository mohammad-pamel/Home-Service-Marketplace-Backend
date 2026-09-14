import { Router } from "express";
import { Role } from "../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";
import { ProviderServiceValidation } from "./providerService.validation";
import { auth } from "../../middlewares/checkAuth";
import { ProviderServiceController } from "./providerService.controller";


const router = Router();

// Provider adds a service
router.post(
  "/",
  auth(Role.PROVIDER),
  validateRequest(
    ProviderServiceValidation.CreateProviderServiceZodSchema,
  ),
  ProviderServiceController.addServiceToProvider,
);

// Provider gets own services
router.get(
  "/my-services",
  auth(Role.PROVIDER),
  ProviderServiceController.getMyServices,
);

// Provider updates own service price
router.patch(
  "/:id",
  auth(Role.PROVIDER),
  validateRequest(
    ProviderServiceValidation.UpdateProviderServiceZodSchema,
  ),
  ProviderServiceController.updateProviderService,
);

// Provider removes service
router.delete(
  "/:id",
  auth(Role.PROVIDER),
  ProviderServiceController.removeServiceFromProvider,
);

// Public: get services of a provider
router.get(
  "/provider/:providerId",
  ProviderServiceController.getProviderServices,
);

export const ProviderServiceRoutes = router;