import {
  AssignmentStatus,
  Role,
  ServiceRequestStatus,
} from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import {
  ICreateAssignmentPayload,
  IUpdateAssignmentPayload,
} from "./assignment.interface";

const createAssignment = async (
  payload: ICreateAssignmentPayload,
) => {
  const serviceRequest =
    await prisma.serviceRequest.findUnique({
      where: {
        id: payload.serviceRequestId,
      },
    });

  if (!serviceRequest) {
    throw new Error("Service request not found");
  }

  if (serviceRequest.deletedAt) {
    throw new Error("Service request has been deleted");
  }

  if (
    serviceRequest.status !== ServiceRequestStatus.PENDING &&
    serviceRequest.status !== ServiceRequestStatus.MATCHED
  ) {
    throw new Error(
      "Provider can only be assigned to pending or matched requests",
    );
  }

  const provider = await prisma.user.findUnique({
    where: {
      id: payload.providerId,
    },
  });

  if (!provider) {
    throw new Error("Provider not found");
  }

  if (provider.role !== Role.PROVIDER) {
    throw new Error("Selected user is not a provider");
  }

  if (provider.status !== "ACTIVE") {
    throw new Error("Provider is not active");
  }

  if (provider.deletedAt) {
    throw new Error("Provider account has been deleted");
  }

  const providerProfile =
    await prisma.serviceProviderProfile.findUnique({
      where: {
        userId: payload.providerId,
      },
    });

  if (!providerProfile) {
    throw new Error("Provider profile not found");
  }

  const providerOffersService =
    await prisma.providerService.findUnique({
      where: {
        providerId_serviceId: {
          providerId: providerProfile.id,
          serviceId: serviceRequest.serviceId,
        },
      },
    });

  if (!providerOffersService) {
    throw new Error(
      "This provider does not offer the requested service",
    );
  }

  const existingAssignment =
    await prisma.assignment.findUnique({
      where: {
        serviceRequestId_providerId: {
          serviceRequestId: payload.serviceRequestId,
          providerId: payload.providerId,
        },
      },
    });

  if (existingAssignment) {
    throw new Error(
      "This provider is already assigned to this request",
    );
  }

  const assignment = await prisma.$transaction(
    async (tx) => {
      const createdAssignment =
        await tx.assignment.create({
          data: {
            serviceRequestId: payload.serviceRequestId,
            providerId: payload.providerId,
            status: AssignmentStatus.PENDING,
          },

          include: {
            provider: {
              omit: {
                password: true,
              },
              include: {
                serviceProviderProfile: true,
              },
            },

            serviceRequest: {
              include: {
                service: true,
                location: true,
              },
            },
          },
        });

      await tx.serviceRequest.update({
        where: {
          id: payload.serviceRequestId,
        },
        data: {
          status: ServiceRequestStatus.MATCHED,
        },
      });

      return createdAssignment;
    },
  );

  return assignment;
};

const getMyAssignments = async (userId: string) => {
  const assignments = await prisma.assignment.findMany({
    where: {
      providerId: userId,
    },

    include: {
      serviceRequest: {
        include: {
          service: true,
          location: true,
          customer: {
            omit: {
              password: true,
            },
          },
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return assignments;
};

const updateAssignmentStatus = async (
  userId: string,
  assignmentId: string,
  payload: IUpdateAssignmentPayload,
) => {
  const assignment = await prisma.assignment.findFirst({
    where: {
      id: assignmentId,
      providerId: userId,
    },

    include: {
      serviceRequest: true,
    },
  });

  if (!assignment) {
    throw new Error(
      "Assignment not found or you don't have permission",
    );
  }

  if (assignment.status !== AssignmentStatus.PENDING) {
    throw new Error(
      "Only pending assignments can be responded to",
    );
  }

  if (payload.status === "REJECTED") {
    const updated =
      await prisma.assignment.update({
        where: {
          id: assignmentId,
        },

        data: {
          status: AssignmentStatus.REJECTED,
          respondedAt: new Date(),
        },

        include: {
          serviceRequest: true,
        },
      });

    return updated;
  }

  const result = await prisma.$transaction(
    async (tx) => {
      const updatedAssignment =
        await tx.assignment.update({
          where: {
            id: assignmentId,
          },

          data: {
            status: AssignmentStatus.ACCEPTED,
            respondedAt: new Date(),
          },

          include: {
            serviceRequest: {
              include: {
                service: true,
                location: true,
              },
            },
          },
        });

      await tx.serviceRequest.update({
        where: {
          id: assignment.serviceRequestId,
        },

        data: {
          status: ServiceRequestStatus.ACCEPTED,
        },
      });

      return updatedAssignment;
    },
  );

  return result;
};

const getAssignmentsByRequest = async (
  serviceRequestId: string,
) => {
  const serviceRequest =
    await prisma.serviceRequest.findUnique({
      where: {
        id: serviceRequestId,
      },
    });

  if (!serviceRequest) {
    throw new Error("Service request not found");
  }

  const assignments = await prisma.assignment.findMany({
    where: {
      serviceRequestId,
    },

    include: {
      provider: {
        omit: {
          password: true,
        },

        include: {
          serviceProviderProfile: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return assignments;
};

export const AssignmentService = {
  createAssignment,
  getMyAssignments,
  updateAssignmentStatus,
  getAssignmentsByRequest,
};