import { Router } from "express";
import { Role } from "../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";
import { AssignmentController } from "./assignment.controller";
import { AssignmentValidation } from "./assignment.validation";
import { auth } from "../../middlewares/checkAuth";

const router = Router();

router.post(
  "/",
  auth(Role.ADMIN),
  validateRequest(
    AssignmentValidation.CreateAssignmentZodSchema,
  ),
  AssignmentController.createAssignment,
);

router.get(
  "/my-assignments",
  auth(Role.PROVIDER),
  AssignmentController.getMyAssignments,
);

router.patch(
  "/:id/status",
  auth(Role.PROVIDER),
  validateRequest(
    AssignmentValidation.UpdateAssignmentZodSchema,
  ),
  AssignmentController.updateAssignmentStatus,
);

router.get(
  "/request/:serviceRequestId",
  auth(Role.ADMIN, Role.CUSTOMER),
  AssignmentController.getAssignmentsByRequest,
);

export const AssignmentRoutes = router;