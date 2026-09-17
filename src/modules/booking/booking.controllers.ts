import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { BookingService } from "./booking.service";

const createBooking = catchAsync(async (req, res) => {
  const userId = req.user!.userId;

  const result = await BookingService.createBooking(
    userId,
    req.body,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Booking created successfully",
    data: result,
  });
});

const getMyBookings = catchAsync(async (req, res) => {
  const userId = req.user!.userId;

  const result =
    await BookingService.getMyBookings(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Bookings retrieved successfully",
    data: result,
  });
});

const getBookingById = catchAsync(async (req, res) => {
  const userId = req.user!.userId;
  const bookingId = req.params.id as string;

  const result =
    await BookingService.getBookingById(
      userId,
      bookingId,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Booking retrieved successfully",
    data: result,
  });
});

const updateBooking = catchAsync(async (req, res) => {
  const userId = req.user!.userId;
  const bookingId = req.params.id as string;

  const result =
    await BookingService.updateBooking(
      userId,
      bookingId,
      req.body,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Booking updated successfully",
    data: result,
  });
});

const cancelBooking = catchAsync(async (req, res) => {
  const userId = req.user!.userId;
  const bookingId = req.params.id as string;

  const result =
    await BookingService.cancelBooking(
      userId,
      bookingId,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Booking cancelled successfully",
    data: result,
  });
});

export const BookingController = {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
};