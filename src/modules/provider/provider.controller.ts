import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ProviderService } from "./provider.service";

const createProviderProfile = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    const result =
      await ProviderService.createProviderProfile(
        userId,
        req.body,
      );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Provider profile created successfully",
      data: result,
    });
  },
);

const getMyProviderProfile = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    const result =
      await ProviderService.getMyProviderProfile(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Provider profile retrieved successfully",
      data: result,
    });
  },
);

const updateMyProviderProfile = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    const result =
      await ProviderService.updateMyProviderProfile(
        userId,
        req.body,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Provider profile updated successfully",
      data: result,
    });
  },
);

const getAllProviders = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await ProviderService.getAllProviders();

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Providers retrieved successfully",
      data: result,
    });
  },
);

const getProviderById = catchAsync(
  async (req: Request, res: Response) => {
    const providerId = req.params.id as string;

    const result =
      await ProviderService.getProviderById(providerId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Provider retrieved successfully",
      data: result,
    });
  },
);

export const ProviderController = {
  createProviderProfile,
  getMyProviderProfile,
  updateMyProviderProfile,
  getAllProviders,
  getProviderById,
};