import { Router } from "express";
import { Role } from "../../generated/prisma/enums";
import { CategoryController } from "./category.controller";
import { auth } from "../../middlewares/checkAuth";

const router = Router();

// Public
router.get(
  "/",
  CategoryController.getAllCategories,
);

router.get(
  "/:id",
  CategoryController.getSingleCategory,
);

// Admin only
router.post(
  "/",
  auth(Role.ADMIN),
  CategoryController.createCategory,
);

router.patch(
  "/:id",
  auth(Role.ADMIN),
  CategoryController.updateCategory,
);

router.delete(
  "/:id",
  auth(Role.ADMIN),
  CategoryController.deleteCategory,
);

export const CategoryRoutes = router;
