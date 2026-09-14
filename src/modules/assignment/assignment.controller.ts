import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AssignmentService } from "./assignment.service";

const createAssignment = catchAsync(async (req, res) => {
  const result = await AssignmentService.createAssignment(
    req.body,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Provider assigned successfully",
    data: result,
  });
});

const getMyAssignments = catchAsync(async (req, res) => {
  const userId = req.user!.userId;

  const result =
    await AssignmentService.getMyAssignments(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Assignments retrieved successfully",
    data: result,
  });
});

const updateAssignmentStatus = catchAsync(
  async (req, res) => {
    const userId = req.user!.userId;
    const assignmentId = req.params.id as string;

    const result =
      await AssignmentService.updateAssignmentStatus(
        userId,
        assignmentId,
        req.body,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Assignment status updated successfully",
      data: result,
    });
  },
);

const getAssignmentsByRequest = catchAsync(
  async (req, res) => {
    const serviceRequestId =
      req.params.serviceRequestId as string;

    const result =
      await AssignmentService.getAssignmentsByRequest(
        serviceRequestId,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Request assignments retrieved successfully",
      data: result,
    });
  },
);

export const AssignmentController = {
  createAssignment,
  getMyAssignments,
  updateAssignmentStatus,
  getAssignmentsByRequest,
};