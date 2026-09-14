import { Router } from "express";
import { Role } from "../../generated/prisma/enums";
import { ServiceController } from "./service.controller";
import { auth } from "../../middlewares/checkAuth";

const router = Router();

// Public
router.get(
  "/",
  ServiceController.getAllServices,
);

router.get(
  "/:id",
  ServiceController.getSingleService,
);

// Admin only
router.post(
  "/",
  auth(Role.ADMIN),
  ServiceController.createService,
);

router.patch(
  "/:id",
  auth(Role.ADMIN),
  ServiceController.updateService,
);

router.delete(
  "/:id",
  auth(Role.ADMIN),
  ServiceController.deleteService,
);

export const ServiceRoutes = router;
