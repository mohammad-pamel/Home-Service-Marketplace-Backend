import { Router } from "express";
import { Role } from "../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";
import { auth } from "../../middlewares/checkAuth";
import { BookingValidation } from "./booking.validation";
import { BookingController } from "./booking.controllers";

const router = Router();

router.post(
  "/",
  auth(Role.CUSTOMER),
  validateRequest(
    BookingValidation.CreateBookingZodSchema,
  ),
  BookingController.createBooking,
);

router.get(
  "/my-bookings",
  auth(Role.CUSTOMER, Role.PROVIDER),
  BookingController.getMyBookings,
);

router.get(
  "/:id",
  auth(Role.CUSTOMER, Role.PROVIDER),
  BookingController.getBookingById,
);

router.patch(
  "/:id",
  auth(Role.CUSTOMER),
  validateRequest(
    BookingValidation.UpdateBookingZodSchema,
  ),
  BookingController.updateBooking,
);

router.patch(
  "/:id/cancel",
  auth(Role.CUSTOMER),
  BookingController.cancelBooking,
);

export const BookingRoutes = router;