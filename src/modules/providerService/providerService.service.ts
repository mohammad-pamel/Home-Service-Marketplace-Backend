import { prisma } from "../../lib/prisma";
import { ICreateProviderServicePayload, IUpdateProviderServicePayload } from "./providerService.interface";


const addServiceToProvider = async (
  userId: string,
  payload: ICreateProviderServicePayload,
) => {
  // Find provider profile
  const provider =
    await prisma.serviceProviderProfile.findUnique({
      where: {
        userId,
      },
    });

  if (!provider) {
    throw new Error("Provider profile not found");
  }

  // Check service exists
  const service = await prisma.service.findUnique({
    where: {
      id: payload.serviceId,
    },
  });

  if (!service) {
    throw new Error("Service not found");
  }

  if (!service.isActive || service.deletedAt) {
    throw new Error("This service is not available");
  }

  // Check duplicate provider-service
  const existing =
    await prisma.providerService.findUnique({
      where: {
        providerId_serviceId: {
          providerId: provider.id,
          serviceId: payload.serviceId,
        },
      },
    });

  if (existing) {
    throw new Error(
      "This service is already added to your profile",
    );
  }

  const providerService =
    await prisma.providerService.create({
      data: {
        providerId: provider.id,
        serviceId: payload.serviceId,
        price: payload.price,
      },
      include: {
        service: {
          include: {
            category: true,
          },
        },
        provider: {
          include: {
            user: {
              omit: {
                password: true,
              },
            },
          },
        },
      },
    });

  return providerService;
};

const getMyServices = async (userId: string) => {
  const provider =
    await prisma.serviceProviderProfile.findUnique({
      where: {
        userId,
      },
    });

  if (!provider) {
    throw new Error("Provider profile not found");
  }

  const services =
    await prisma.providerService.findMany({
      where: {
        providerId: provider.id,
        service: {
          deletedAt: null,
        },
      },
      include: {
        service: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  return services;
};

const updateProviderService = async (
  userId: string,
  providerServiceId: string,
  payload: IUpdateProviderServicePayload,
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

  const providerService =
    await prisma.providerService.findFirst({
      where: {
        id: providerServiceId,
        providerId: provider.id,
      },
    });

  if (!providerService) {
    throw new Error(
      "Provider service not found or you don't have permission",
    );
  }

  const updated =
    await prisma.providerService.update({
      where: {
        id: providerServiceId,
      },
      data: {
        price: payload.price,
      },
      include: {
        service: {
          include: {
            category: true,
          },
        },
      },
    });

  return updated;
};

const removeServiceFromProvider = async (
  userId: string,
  providerServiceId: string,
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

  const providerService =
    await prisma.providerService.findFirst({
      where: {
        id: providerServiceId,
        providerId: provider.id,
      },
    });

  if (!providerService) {
    throw new Error(
      "Provider service not found or you don't have permission",
    );
  }

  await prisma.providerService.delete({
    where: {
      id: providerServiceId,
    },
  });

  return null;
};

const getProviderServices = async (
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

  const services =
    await prisma.providerService.findMany({
      where: {
        providerId,
        service: {
          deletedAt: null,
        },
      },
      include: {
        service: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  return services;
};

export const ProviderServiceService = {
  addServiceToProvider,
  getMyServices,
  updateProviderService,
  removeServiceFromProvider,
  getProviderServices,
};