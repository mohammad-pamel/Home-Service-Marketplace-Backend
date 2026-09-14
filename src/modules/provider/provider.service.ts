import { prisma } from "../../lib/prisma";
import {
  ICreateProviderProfilePayload,
  IUpdateProviderProfilePayload,
} from "./provider.interface";

const createProviderProfile = async (
  userId: string,
  payload: ICreateProviderProfilePayload,
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role !== "PROVIDER") {
    throw new Error("Only providers can create a provider profile");
  }

  const existingProfile =
    await prisma.serviceProviderProfile.findUnique({
      where: {
        userId,
      },
    });

  if (existingProfile) {
    throw new Error("Provider profile already exists");
  }

  const profile =
    await prisma.serviceProviderProfile.create({
      data: {
        userId,
        bio: payload.bio,
        experienceYears: payload.experienceYears,
        serviceArea: payload.serviceArea,
        latitude: payload.latitude,
        longitude: payload.longitude,
      },
      include: {
        user: {
          omit: {
            password: true,
          },
        },
      },
    });

  return profile;
};

const getMyProviderProfile = async (userId: string) => {
  const profile =
    await prisma.serviceProviderProfile.findUnique({
      where: {
        userId,
      },
      include: {
        user: {
          omit: {
            password: true,
          },
        },
      },
    });

  if (!profile) {
    throw new Error("Provider profile not found");
  }

  return profile;
};

const updateMyProviderProfile = async (
  userId: string,
  payload: IUpdateProviderProfilePayload,
) => {
  const existingProfile =
    await prisma.serviceProviderProfile.findUnique({
      where: {
        userId,
      },
    });

  if (!existingProfile) {
    throw new Error("Provider profile not found");
  }

  const updatedProfile =
    await prisma.serviceProviderProfile.update({
      where: {
        userId,
      },
      data: {
        bio: payload.bio,
        experienceYears: payload.experienceYears,
        serviceArea: payload.serviceArea,
        latitude: payload.latitude,
        longitude: payload.longitude,
      },
      include: {
        user: {
          omit: {
            password: true,
          },
        },
      },
    });

  return updatedProfile;
};

const getAllProviders = async () => {
  const providers =
    await prisma.serviceProviderProfile.findMany({
      where: {
        user: {
          deletedAt: null,
          status: "ACTIVE",
        },
      },
      include: {
        user: {
          omit: {
            password: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  return providers;
};

const getProviderById = async (providerId: string) => {
  const provider =
    await prisma.serviceProviderProfile.findUnique({
      where: {
        id: providerId,
      },
      include: {
        user: {
          omit: {
            password: true,
          },
        },
      },
    });

  if (!provider) {
    throw new Error("Provider not found");
  }

  return provider;
};

export const ProviderService = {
  createProviderProfile,
  getMyProviderProfile,
  updateMyProviderProfile,
  getAllProviders,
  getProviderById,
};