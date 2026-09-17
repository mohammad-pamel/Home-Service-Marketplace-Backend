import { Router } from "express";
import { Role } from "../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";
import { WorkLogController } from "./work-log.controller";
import { WorkLogValidation } from "./work-log.validation";
import { auth } from "../../middlewares/checkAuth";

const router = Router();

router.post(
  "/",
  auth(Role.PROVIDER),
  validateRequest(
    WorkLogValidation.CreateWorkLogZodSchema,
  ),
  WorkLogController.createWorkLog,
);

router.get(
  "/my-logs",
  auth(Role.PROVIDER),
  WorkLogController.getMyWorkLogs,
);

router.get(
  "/booking/:bookingId",
  auth(Role.CUSTOMER, Role.PROVIDER),
  WorkLogController.getWorkLogsByBooking,
);

router.patch(
  "/:id",
  auth(Role.PROVIDER),
  validateRequest(
    WorkLogValidation.UpdateWorkLogZodSchema,
  ),
  WorkLogController.updateWorkLog,
);

router.delete(
  "/:id",
  auth(Role.PROVIDER),
  WorkLogController.deleteWorkLog,
);

router.patch(
  "/:id/complete",
  auth(Role.PROVIDER),
  WorkLogController.completeWorkLog,
);

export const WorkLogRoutes = router;