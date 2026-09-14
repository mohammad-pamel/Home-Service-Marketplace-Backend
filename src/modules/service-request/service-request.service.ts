import { ServiceRequestStatus } from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import {
  ICreateServiceRequestPayload,
  IUpdateServiceRequestPayload,
} from "./service-request.interface";

const createServiceRequest = async (
  userId: string,
  payload: ICreateServiceRequestPayload,
) => {
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

  const result = await prisma.$transaction(async (tx) => {
    const location = await tx.location.create({
      data: {
        address: payload.address,
        city: payload.city,
        area: payload.area,
        latitude: payload.latitude,
        longitude: payload.longitude,
      },
    });

    const serviceRequest = await tx.serviceRequest.create({
      data: {
        customerId: userId,
        serviceId: payload.serviceId,
        locationId: location.id,
        title: payload.title,
        description: payload.description,
        preferredDate: payload.preferredDate
          ? new Date(payload.preferredDate)
          : undefined,
        preferredTime: payload.preferredTime,
        status: ServiceRequestStatus.PENDING,
      },

      include: {
        service: {
          include: {
            category: true,
          },
        },
        location: true,
      },
    });

    return serviceRequest;
  });

  return result;
};

const getMyServiceRequests = async (userId: string) => {
  const requests = await prisma.serviceRequest.findMany({
    where: {
      customerId: userId,
      deletedAt: null,
    },

    include: {
      service: {
        include: {
          category: true,
        },
      },

      location: true,

      assignments: {
        include: {
          provider: {
            include: {
              serviceProviderProfile: true,
            },
            omit: {
              password: true,
            },
          },
        },
      },

      booking: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return requests;
};

const getServiceRequestById = async (
  userId: string,
  requestId: string,
) => {
  const request = await prisma.serviceRequest.findFirst({
    where: {
      id: requestId,
      customerId: userId,
      deletedAt: null,
    },

    include: {
      service: {
        include: {
          category: true,
        },
      },

      location: true,

      assignments: {
        include: {
          provider: {
            include: {
              serviceProviderProfile: true,
            },
            omit: {
              password: true,
            },
          },
        },
      },

      booking: true,

      attachments: true,
    },
  });

  if (!request) {
    throw new Error("Service request not found");
  }

  return request;
};

const updateServiceRequest = async (
  userId: string,
  requestId: string,
  payload: IUpdateServiceRequestPayload,
) => {
  const existingRequest = await prisma.serviceRequest.findFirst({
    where: {
      id: requestId,
      customerId: userId,
      deletedAt: null,
    },
  });

  if (!existingRequest) {
    throw new Error("Service request not found");
  }

  if (
    existingRequest.status !== ServiceRequestStatus.PENDING
  ) {
    throw new Error(
      "Only pending service requests can be updated",
    );
  }

  const updatedRequest = await prisma.$transaction(async (tx) => {
    let locationId = existingRequest.locationId;

    if (
      payload.address !== undefined ||
      payload.city !== undefined ||
      payload.area !== undefined ||
      payload.latitude !== undefined ||
      payload.longitude !== undefined
    ) {
      await tx.location.update({
        where: {
          id: existingRequest.locationId,
        },

        data: {
          address: payload.address,
          city: payload.city,
          area: payload.area,
          latitude: payload.latitude,
          longitude: payload.longitude,
        },
      });
    }

    const request = await tx.serviceRequest.update({
      where: {
        id: requestId,
      },

      data: {
        title: payload.title,
        description: payload.description,

        preferredDate: payload.preferredDate
          ? new Date(payload.preferredDate)
          : undefined,

        preferredTime: payload.preferredTime,

        locationId,
      },

      include: {
        service: true,
        location: true,
      },
    });

    return request;
  });

  return updatedRequest;
};

const cancelServiceRequest = async (
  userId: string,
  requestId: string,
) => {
  const existingRequest = await prisma.serviceRequest.findFirst({
    where: {
      id: requestId,
      customerId: userId,
      deletedAt: null,
    },
  });

  if (!existingRequest) {
    throw new Error("Service request not found");
  }

  if (
    existingRequest.status !== ServiceRequestStatus.PENDING &&
    existingRequest.status !== ServiceRequestStatus.MATCHED
  ) {
    throw new Error(
      "This service request cannot be cancelled at this stage",
    );
  }

  const cancelledRequest =
    await prisma.serviceRequest.update({
      where: {
        id: requestId,
      },

      data: {
        status: ServiceRequestStatus.CANCELLED,
      },

      include: {
        service: true,
        location: true,
      },
    });

  return cancelledRequest;
};

export const ServiceRequestService = {
  createServiceRequest,
  getMyServiceRequests,
  getServiceRequestById,
  updateServiceRequest,
  cancelServiceRequest,
};