import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ProviderServiceService } from "./providerService.service";


const addServiceToProvider = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    const result =
      await ProviderServiceService.addServiceToProvider(
        userId,
        req.body,
      );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Service added to provider successfully",
      data: result,
    });
  },
);

const getMyServices = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    const result =
      await ProviderServiceService.getMyServices(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Provider services retrieved successfully",
      data: result,
    });
  },
);

const updateProviderService = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const providerServiceId =
      req.params.id as string;

    const result =
      await ProviderServiceService.updateProviderService(
        userId,
        providerServiceId,
        req.body,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Provider service updated successfully",
      data: result,
    });
  },
);

const removeServiceFromProvider = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const providerServiceId =
      req.params.id as string;

    await ProviderServiceService.removeServiceFromProvider(
      userId,
      providerServiceId,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Service removed from provider successfully",
      data: null,
    });
  },
);

const getProviderServices = catchAsync(
  async (req: Request, res: Response) => {
    const providerId =
      req.params.providerId as string;

    const result =
      await ProviderServiceService.getProviderServices(
        providerId,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Provider services retrieved successfully",
      data: result,
    });
  },
);

export const ProviderServiceController = {
  addServiceToProvider,
  getMyServices,
  updateProviderService,
  removeServiceFromProvider,
  getProviderServices,
};