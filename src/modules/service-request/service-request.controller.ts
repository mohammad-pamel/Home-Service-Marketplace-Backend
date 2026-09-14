import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ServiceRequestService } from "./service-request.service";

const createServiceRequest = catchAsync(async (req, res) => {
  const userId = req.user!.userId;

  const result =
    await ServiceRequestService.createServiceRequest(
      userId,
      req.body,
    );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Service request created successfully",
    data: result,
  });
});

const getMyServiceRequests = catchAsync(async (req, res) => {
  const userId = req.user!.userId;

  const result =
    await ServiceRequestService.getMyServiceRequests(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Service requests retrieved successfully",
    data: result,
  });
});

const getServiceRequestById = catchAsync(async (req, res) => {
  const userId = req.user!.userId;
  const requestId = req.params.id as string;

  const result =
    await ServiceRequestService.getServiceRequestById(
      userId,
      requestId,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Service request retrieved successfully",
    data: result,
  });
});

const updateServiceRequest = catchAsync(async (req, res) => {
  const userId = req.user!.userId;
  const requestId = req.params.id as string;

  const result =
    await ServiceRequestService.updateServiceRequest(
      userId,
      requestId,
      req.body,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Service request updated successfully",
    data: result,
  });
});

const cancelServiceRequest = catchAsync(async (req, res) => {
  const userId = req.user!.userId;
  const requestId = req.params.id as string;

  const result =
    await ServiceRequestService.cancelServiceRequest(
      userId,
      requestId,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Service request cancelled successfully",
    data: result,
  });
});

export const ServiceRequestController = {
  createServiceRequest,
  getMyServiceRequests,
  getServiceRequestById,
  updateServiceRequest,
  cancelServiceRequest,
};