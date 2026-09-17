import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { EstimateService } from "./estimate.service";

const createEstimate = catchAsync(async (req, res) => {
  const userId = req.user!.userId;

  const result =
    await EstimateService.createEstimate(
      userId,
      req.body,
    );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Estimate created successfully",
    data: result,
  });
});

const getMyProviderEstimates = catchAsync(
  async (req, res) => {
    const userId = req.user!.userId;

    const result =
      await EstimateService.getMyProviderEstimates(
        userId,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Provider estimates retrieved successfully",
      data: result,
    });
  },
);

const getMyCustomerEstimates = catchAsync(
  async (req, res) => {
    const userId = req.user!.userId;

    const result =
      await EstimateService.getMyCustomerEstimates(
        userId,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Customer estimates retrieved successfully",
      data: result,
    });
  },
);

const getEstimateById = catchAsync(async (req, res) => {
  const userId = req.user!.userId;
  const estimateId = req.params.id as string;

  const result =
    await EstimateService.getEstimateById(
      userId,
      estimateId,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Estimate retrieved successfully",
    data: result,
  });
});

const updateEstimate = catchAsync(async (req, res) => {
  const userId = req.user!.userId;
  const estimateId = req.params.id as string;

  const result =
    await EstimateService.updateEstimate(
      userId,
      estimateId,
      req.body,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Estimate updated successfully",
    data: result,
  });
});

const approveEstimate = catchAsync(async (req, res) => {
  const userId = req.user!.userId;
  const estimateId = req.params.id as string;

  const result =
    await EstimateService.approveEstimate(
      userId,
      estimateId,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Estimate approved successfully",
    data: result,
  });
});

const rejectEstimate = catchAsync(async (req, res) => {
  const userId = req.user!.userId;
  const estimateId = req.params.id as string;

  const result =
    await EstimateService.rejectEstimate(
      userId,
      estimateId,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Estimate rejected successfully",
    data: result,
  });
});

export const EstimateController = {
  createEstimate,
  getMyProviderEstimates,
  getMyCustomerEstimates,
  getEstimateById,
  updateEstimate,
  approveEstimate,
  rejectEstimate,
};