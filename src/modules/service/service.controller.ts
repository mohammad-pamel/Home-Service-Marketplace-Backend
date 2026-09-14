import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ServiceService } from "./service.service";
import { ServiceValidation } from "./service.validation";

const createService = catchAsync(
  async (req: Request, res: Response) => {
    const payload =
      ServiceValidation.CreateServiceZodSchema.parse(
        req.body,
      );

    const result =
      await ServiceService.createService(payload);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Service created successfully",
      data: result,
    });
  },
);

const getAllServices = catchAsync(
  async (req: Request, res: Response) => {
    const query =
      ServiceValidation.ServiceQueryZodSchema.parse(
        req.query,
      );

    const result =
      await ServiceService.getAllServices(query);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Services retrieved successfully",
      data: result,
    });
  },
);

const getSingleService = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await ServiceService.getSingleService(
        req.params.id as string,
      );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Service retrieved successfully",
      data: result,
    });
  },
);

const updateService = catchAsync(
  async (req: Request, res: Response) => {
    const payload =
      ServiceValidation.UpdateServiceZodSchema.parse(
        req.body,
      );

    const result =
      await ServiceService.updateService(
        req.params.id as string,
        payload,
      );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Service updated successfully",
      data: result,
    });
  },
);

const deleteService = catchAsync(
  async (req: Request, res: Response) => {
    await ServiceService.deleteService(
      req.params.id as string,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Service deleted successfully",
      data: null,
    });
  },
);

export const ServiceController = {
  createService,
  getAllServices,
  getSingleService,
  updateService,
  deleteService,
};
