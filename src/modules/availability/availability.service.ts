import { prisma } from "../../lib/prisma";
import {
  ICreateAvailabilityPayload,
  IUpdateAvailabilityPayload,
} from "./availability.interface";

const createAvailability = async (
  userId: string,
  payload: ICreateAvailabilityPayload,
) => {
  const provider =
    await prisma.serviceProviderProfile.findUnique({
      where: {
        userId,
      },
    });

  if (!provider) {
    throw new Error("Provider profile not found");
  }

  if (payload.startTime >= payload.endTime) {
    throw new Error(
      "Start time must be earlier than end time",
    );
  }

  const existing =
    await prisma.availability.findFirst({
      where: {
        providerId: provider.id,
        dayOfWeek: payload.dayOfWeek,
      },
    });

  if (existing) {
    throw new Error(
      "Availability for this day already exists",
    );
  }

  const availability =
    await prisma.availability.create({
      data: {
        providerId: provider.id,
        dayOfWeek: payload.dayOfWeek,
        startTime: payload.startTime,
        endTime: payload.endTime,
        isAvailable:
          payload.isAvailable ?? true,
      },
    });

  return availability;
};

const getMyAvailability = async (
  userId: string,
) => {
  const provider =
    await prisma.serviceProviderProfile.findUnique({
      where: {
        userId,
      },
    });

  if (!provider) {
    throw new Error("Provider profile not found");
  }

  const availability =
    await prisma.availability.findMany({
      where: {
        providerId: provider.id,
      },
      orderBy: {
        dayOfWeek: "asc",
      },
    });

  return availability;
};

const updateAvailability = async (
  userId: string,
  availabilityId: string,
  payload: IUpdateAvailabilityPayload,
) => {
  const provider =
    await prisma.serviceProviderProfile.findUnique({
      where: {
        userId,
      },
    });

  if (!provider) {
    throw new Error("Provider profile not found");
  }

  const existing =
    await prisma.availability.findFirst({
      where: {
        id: availabilityId,
        providerId: provider.id,
      },
    });

  if (!existing) {
    throw new Error(
      "Availability not found or you don't have permission",
    );
  }

  const startTime =
    payload.startTime ?? existing.startTime;

  const endTime =
    payload.endTime ?? existing.endTime;

  if (startTime >= endTime) {
    throw new Error(
      "Start time must be earlier than end time",
    );
  }

  if (
    payload.dayOfWeek !== undefined &&
    payload.dayOfWeek !== existing.dayOfWeek
  ) {
    const duplicate =
      await prisma.availability.findFirst({
        where: {
          providerId: provider.id,
          dayOfWeek: payload.dayOfWeek,
          id: {
            not: availabilityId,
          },
        },
      });

    if (duplicate) {
      throw new Error(
        "Availability for this day already exists",
      );
    }
  }

  const updated =
    await prisma.availability.update({
      where: {
        id: availabilityId,
      },
      data: {
        dayOfWeek: payload.dayOfWeek,
        startTime: payload.startTime,
        endTime: payload.endTime,
        isAvailable: payload.isAvailable,
      },
    });

  return updated;
};

const deleteAvailability = async (
  userId: string,
  availabilityId: string,
) => {
  const provider =
    await prisma.serviceProviderProfile.findUnique({
      where: {
        userId,
      },
    });

  if (!provider) {
    throw new Error("Provider profile not found");
  }

  const existing =
    await prisma.availability.findFirst({
      where: {
        id: availabilityId,
        providerId: provider.id,
      },
    });

  if (!existing) {
    throw new Error(
      "Availability not found or you don't have permission",
    );
  }

  await prisma.availability.delete({
    where: {
      id: availabilityId,
    },
  });

  return null;
};

const getProviderAvailability = async (
  providerId: string,
) => {
  const provider =
    await prisma.serviceProviderProfile.findUnique({
      where: {
        id: providerId,
      },
    });

  if (!provider) {
    throw new Error("Provider not found");
  }

  return prisma.availability.findMany({
    where: {
      providerId,
      isAvailable: true,
    },
    orderBy: {
      dayOfWeek: "asc",
    },
  });
};

export const AvailabilityService = {
  createAvailability,
  getMyAvailability,
  updateAvailability,
  deleteAvailability,
  getProviderAvailability,
};