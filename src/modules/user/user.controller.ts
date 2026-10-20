import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

import { AppError } from "../../utils/appError";
import { UserServices } from "./user.service";

const getAllUsers = catchAsync(
  async (req: Request, res: Response) => {
	const result =
	  await UserServices.getAllUsers();

	  console.log("result", result)

	sendResponse(res, {
	  statusCode: 200,
	  success: true,
	  message: "Users retrieved successfully",
	  data: result,
	});
  },
);

const uploadProfileImage = catchAsync(async (req: Request, res: Response) => {
	if (!req.file) {
		throw new AppError(httpStatus.BAD_REQUEST, "No File Provided.");
	}

	const userId = req.user?.userId;

	const result = await UserServices.uploadProfileImage(
		req.file?.buffer,
		userId!,
	);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "New tokens generated successfully",
		data: result,
	});
});

export const UserController = {
	uploadProfileImage,
	getAllUsers
};