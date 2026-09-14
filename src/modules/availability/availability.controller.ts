import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AvailabilityService } from "./availability.service";

const createAvailability = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    const result =
      await AvailabilityService.createAvailability(
        userId,
        req.body,
      );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Availability created successfully",
      data: result,
    });
  },
);

const getMyAvailability = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    const result =
      await AvailabilityService.getMyAvailability(
        userId,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Availability retrieved successfully",
      data: result,
    });
  },
);

const updateAvailability = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const availabilityId =
      req.params.id as string;

    const result =
      await AvailabilityService.updateAvailability(
        userId,
        availabilityId,
        req.body,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Availability updated successfully",
      data: result,
    });
  },
);

const deleteAvailability = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const availabilityId =
      req.params.id as string;

    await AvailabilityService.deleteAvailability(
      userId,
      availabilityId,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Availability deleted successfully",
      data: null,
    });
  },
);

const getProviderAvailability = catchAsync(
  async (req: Request, res: Response) => {
    const providerId =
      req.params.providerId as string;

    const result =
      await AvailabilityService.getProviderAvailability(
        providerId,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message:
        "Provider availability retrieved successfully",
      data: result,
    });
  },
);

export const AvailabilityController = {
  createAvailability,
  getMyAvailability,
  updateAvailability,
  deleteAvailability,
  getProviderAvailability,
};