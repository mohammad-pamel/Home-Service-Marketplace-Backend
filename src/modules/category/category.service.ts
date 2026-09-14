import { prisma } from "../../lib/prisma";
import {
  ICreateCategoryPayload,
  IUpdateCategoryPayload,
} from "./category.interface";

const createCategory = async (
  payload: ICreateCategoryPayload,
) => {
  const slug = payload.slug.trim().toLowerCase();

  const existingCategory =
    await prisma.serviceCategory.findFirst({
      where: {
        OR: [
          {
            name: {
              equals: payload.name.trim(),
              mode: "insensitive",
            },
          },
          {
            slug,
          },
        ],
        deletedAt: null,
      },
    });

  if (existingCategory) {
    throw new Error(
      "Category with this name or slug already exists",
    );
  }

  const category = await prisma.serviceCategory.create({
    data: {
      name: payload.name.trim(),
      slug,
      description: payload.description,
      image: payload.image,
    },
  });

  return category;
};

const getAllCategories = async () => {
  const categories =
    await prisma.serviceCategory.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  return categories;
};

const getSingleCategory = async (
  categoryId: string,
) => {
  const category =
    await prisma.serviceCategory.findFirst({
      where: {
        id: categoryId,
        deletedAt: null,
      },
      include: {
        services: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

  if (!category) {
    throw new Error("Category not found");
  }

  return category;
};

const updateCategory = async (
  categoryId: string,
  payload: IUpdateCategoryPayload,
) => {
  const category =
    await prisma.serviceCategory.findFirst({
      where: {
        id: categoryId,
        deletedAt: null,
      },
    });

  if (!category) {
    throw new Error("Category not found");
  }

  if (payload.name || payload.slug) {
    const duplicate =
      await prisma.serviceCategory.findFirst({
        where: {
          id: {
            not: categoryId,
          },
          OR: [
            ...(payload.name
              ? [
                  {
                    name: {
                      equals: payload.name.trim(),
                      mode: "insensitive" as const,
                    },
                  },
                ]
              : []),
            ...(payload.slug
              ? [
                  {
                    slug: payload.slug
                      .trim()
                      .toLowerCase(),
                  },
                ]
              : []),
          ],
          deletedAt: null,
        },
      });

    if (duplicate) {
      throw new Error(
        "Category with this name or slug already exists",
      );
    }
  }

  const updatedCategory =
    await prisma.serviceCategory.update({
      where: {
        id: categoryId,
      },
      data: {
        name: payload.name?.trim(),
        slug: payload.slug
          ?.trim()
          .toLowerCase(),
        description: payload.description,
        image: payload.image,
        isActive: payload.isActive,
      },
    });

  return updatedCategory;
};

const deleteCategory = async (
  categoryId: string,
) => {
  const category =
    await prisma.serviceCategory.findFirst({
      where: {
        id: categoryId,
        deletedAt: null,
      },
    });

  if (!category) {
    throw new Error("Category not found");
  }

  await prisma.serviceCategory.update({
    where: {
      id: categoryId,
    },
    data: {
      deletedAt: new Date(),
    },
  });

  return null;
};

export const CategoryService = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};
