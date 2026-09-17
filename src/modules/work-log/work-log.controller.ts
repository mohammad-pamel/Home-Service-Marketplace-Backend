import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { WorkLogService } from "./work-log.service";

const createWorkLog = catchAsync(
  async (req, res) => {
    const userId = req.user!.userId;

    const result =
      await WorkLogService.createWorkLog(
        userId,
        req.body,
      );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Work log created successfully",
      data: result,
    });
  },
);

const getMyWorkLogs = catchAsync(
  async (req, res) => {
    const userId = req.user!.userId;

    const result =
      await WorkLogService.getMyWorkLogs(
        userId,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Work logs retrieved successfully",
      data: result,
    });
  },
);

const getWorkLogsByBooking = catchAsync(
  async (req, res) => {
    const userId = req.user!.userId;
    const bookingId =
      req.params.bookingId as string;

    const result =
      await WorkLogService.getWorkLogsByBooking(
        userId,
        bookingId,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Booking work logs retrieved successfully",
      data: result,
    });
  },
);

const updateWorkLog = catchAsync(
  async (req, res) => {
    const userId = req.user!.userId;
    const workLogId =
      req.params.id as string;

    const result =
      await WorkLogService.updateWorkLog(
        userId,
        workLogId,
        req.body,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Work log updated successfully",
      data: result,
    });
  },
);

const deleteWorkLog = catchAsync(
  async (req, res) => {
    const userId = req.user!.userId;
    const workLogId =
      req.params.id as string;

    await WorkLogService.deleteWorkLog(
      userId,
      workLogId,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Work log deleted successfully",
      data: null,
    });
  },
);

const completeWorkLog = catchAsync(
  async (req, res) => {
    const userId = req.user!.userId;
    const workLogId =
      req.params.id as string;

    const result =
      await WorkLogService.completeWorkLog(
        userId,
        workLogId,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Work completed successfully",
      data: result,
    });
  },
);

export const WorkLogController = {
  createWorkLog,
  getMyWorkLogs,
  getWorkLogsByBooking,
  updateWorkLog,
  deleteWorkLog,
  completeWorkLog,
};