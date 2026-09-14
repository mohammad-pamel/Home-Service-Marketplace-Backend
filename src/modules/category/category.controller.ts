import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { CategoryService } from "./category.service";
import { CategoryValidation } from "./category.validation";

const createCategory = catchAsync(
  async (req: Request, res: Response) => {
    const payload =
      CategoryValidation.CreateCategoryZodSchema.parse(
        req.body,
      );

    const result =
      await CategoryService.createCategory(payload);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Category created successfully",
      data: result,
    });
  },
);

const getAllCategories = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await CategoryService.getAllCategories();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Categories retrieved successfully",
      data: result,
    });
  },
);

const getSingleCategory = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await CategoryService.getSingleCategory(
        req.params.id as string,
      );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Category retrieved successfully",
      data: result,
    });
  },
);

const updateCategory = catchAsync(
  async (req: Request, res: Response) => {
    const payload =
      CategoryValidation.UpdateCategoryZodSchema.parse(
        req.body,
      );

    const result =
      await CategoryService.updateCategory(
        req.params.id as string,
        payload,
      );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Category updated successfully",
      data: result,
    });
  },
);

const deleteCategory = catchAsync(
  async (req: Request, res: Response) => {
    await CategoryService.deleteCategory(
      req.params.id as string,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Category deleted successfully",
      data: null,
    });
  },
);

export const CategoryController = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};
