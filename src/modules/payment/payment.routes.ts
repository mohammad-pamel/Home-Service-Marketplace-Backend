import { Router } from "express";
import { Role } from "../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";
import { PaymentController } from "./payment.controller";
import { PaymentValidation } from "./payment.validation";
import { auth } from "../../middlewares/checkAuth";

const router = Router();

router.post(
  "/",
  auth(Role.CUSTOMER),
  validateRequest(
    PaymentValidation.CreatePaymentZodSchema,
  ),
  PaymentController.createPayment,
);

router.get(
  "/my-payments",
  auth(Role.CUSTOMER),
  PaymentController.getMyPayments,
);

router.get(
  "/:id",
  auth(Role.CUSTOMER, Role.PROVIDER),
  PaymentController.getPaymentById,
);

router.patch(
  "/:id/status",
  auth(Role.ADMIN),
  validateRequest(
    PaymentValidation.UpdatePaymentStatusZodSchema,
  ),
  PaymentController.updatePaymentStatus,
);

export const PaymentRoutes = router;