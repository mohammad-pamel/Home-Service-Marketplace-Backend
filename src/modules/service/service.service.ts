import { prisma } from "../../lib/prisma";
import {
  ICreateServicePayload,
  IServiceQuery,
  IUpdateServicePayload,
} from "./service.interface";

const createService = async (
  payload: ICreateServicePayload,
) => {
  const category =
    await prisma.serviceCategory.findFirst({
      where: {
        id: payload.categoryId,
        deletedAt: null,
        isActive: true,
      },
    });

  if (!category) {
    throw new Error(
      "Active category not found",
    );
  }

  const existingService =
    await prisma.service.findFirst({
      where: {
        OR: [
          {
            name: {
              equals: payload.name.trim(),
              mode: "insensitive",
            },
          },
          {
            slug: payload.slug
              .trim()
              .toLowerCase(),
          },
        ],
        deletedAt: null,
      },
    });

  if (existingService) {
    throw new Error(
      "Service with this name or slug already exists",
    );
  }

  const service = await prisma.service.create({
    data: {
      categoryId: payload.categoryId,
      name: payload.name.trim(),
      slug: payload.slug
        .trim()
        .toLowerCase(),
      description: payload.description,
      basePrice: payload.basePrice,
      durationMinutes: payload.durationMinutes,
    },
    include: {
      category: true,
    },
  });

  return service;
};

const getAllServices = async (
  query: IServiceQuery,
) => {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const skip = (page - 1) * limit;

  const where = {
    deletedAt: null,
    ...(status === "active"
      ? { isActive: true }
      : status === "inactive"
        ? { isActive: false }
        : {}),
    ...(search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              description: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
  };

  const [services, total] =
    await prisma.$transaction([
      prisma.service.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          category: true,
        },
      }),

      prisma.service.count({
        where,
      }),
    ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: services,
  };
};

const getSingleService = async (
  serviceId: string,
) => {
  const service = await prisma.service.findFirst({
    where: {
      id: serviceId,
      deletedAt: null,
    },
    include: {
      category: true,
      providers: {
        include: {
          provider: {
            select: {
              userId: true,
              bio: true,
              experienceYears: true,
              isVerified: true,
              rating: true,
              totalReviews: true,
              totalJobs: true,
              serviceArea: true,
            },
          },
        },
      },
    },
  });

  if (!service) {
    throw new Error("Service not found");
  }

  return service;
};

const updateService = async (
  serviceId: string,
  payload: IUpdateServicePayload,
) => {
  const service = await prisma.service.findFirst({
    where: {
      id: serviceId,
      deletedAt: null,
    },
  });

  if (!service) {
    throw new Error("Service not found");
  }

  if (payload.categoryId) {
    const category =
      await prisma.serviceCategory.findFirst({
        where: {
          id: payload.categoryId,
          deletedAt: null,
          isActive: true,
        },
      });

    if (!category) {
      throw new Error(
        "Active category not found",
      );
    }
  }

  if (payload.name || payload.slug) {
    const duplicate =
      await prisma.service.findFirst({
        where: {
          id: {
            not: serviceId,
          },
          deletedAt: null,
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
        },
      });

    if (duplicate) {
      throw new Error(
        "Service with this name or slug already exists",
      );
    }
  }

  const updatedService =
    await prisma.service.update({
      where: {
        id: serviceId,
      },
      data: {
        categoryId: payload.categoryId,
        name: payload.name?.trim(),
        slug: payload.slug
          ?.trim()
          .toLowerCase(),
        description: payload.description,
        basePrice: payload.basePrice,
        durationMinutes:
          payload.durationMinutes,
        isActive: payload.isActive,
      },
      include: {
        category: true,
      },
    });

  return updatedService;
};

const deleteService = async (
  serviceId: string,
) => {
  const service = await prisma.service.findFirst({
    where: {
      id: serviceId,
      deletedAt: null,
    },
  });

  if (!service) {
    throw new Error("Service not found");
  }

  await prisma.service.update({
    where: {
      id: serviceId,
    },
    data: {
      deletedAt: new Date(),
    },
  });

  return null;
};

export const ServiceService = {
  createService,
  getAllServices,
  getSingleService,
  updateService,
  deleteService,
};
