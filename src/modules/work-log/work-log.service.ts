import {
  BookingStatus,
} from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import {
  ICreateWorkLogPayload,
  IUpdateWorkLogPayload,
} from "./work-log.interface";

const createWorkLog = async (
  userId: string,
  payload: ICreateWorkLogPayload,
) => {
  const booking = await prisma.booking.findFirst({
    where: {
      id: payload.bookingId,
      providerId: userId,
    },
    include: {
      serviceRequest: {
        include: {
          service: true,
        },
      },
    },
  });

  if (!booking) {
    throw new Error(
      "Booking not found or you don't have permission",
    );
  }

  if (
    booking.status !== BookingStatus.CONFIRMED &&
    booking.status !== BookingStatus.IN_PROGRESS
  ) {
    throw new Error(
      "Work can only be started for a confirmed or in-progress booking",
    );
  }

  const existingWorkLog =
    await prisma.workLog.findFirst({
      where: {
        bookingId: booking.id,
        completedAt: null,
      },
    });

  if (existingWorkLog) {
    throw new Error(
      "There is already an active work log for this booking",
    );
  }

  const workLog = await prisma.$transaction(
    async (tx) => {
      const createdWorkLog =
        await tx.workLog.create({
          data: {
            bookingId: booking.id,
            title: payload.title,
            description: payload.description,
            startedAt: payload.startedAt
              ? new Date(payload.startedAt)
              : new Date(),
          },
          include: {
            booking: {
              include: {
                serviceRequest: {
                  include: {
                    service: true,
                  },
                },
                customer: {
                  omit: {
                    password: true,
                  },
                },
                provider: {
                  omit: {
                    password: true,
                  },
                },
              },
            },
          },
        });

      await tx.booking.update({
        where: {
          id: booking.id,
        },
        data: {
          status: BookingStatus.IN_PROGRESS,
        },
      });

      return createdWorkLog;
    },
  );

  return workLog;
};

const getMyWorkLogs = async (
  userId: string,
) => {
  const workLogs = await prisma.workLog.findMany({
    where: {
      booking: {
        providerId: userId,
      },
    },
    include: {
      booking: {
        include: {
          serviceRequest: {
            include: {
              service: true,
              location: true,
            },
          },
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

  return workLogs;
};

const getWorkLogsByBooking = async (
  userId: string,
  bookingId: string,
) => {
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      OR: [
        {
          customerId: userId,
        },
        {
          providerId: userId,
        },
      ],
    },
  });

  if (!booking) {
    throw new Error(
      "Booking not found or you don't have permission",
    );
  }

  const workLogs =
    await prisma.workLog.findMany({
      where: {
        bookingId,
      },
      include: {
        booking: {
          include: {
            serviceRequest: {
              include: {
                service: true,
                location: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  return workLogs;
};

const updateWorkLog = async (
  userId: string,
  workLogId: string,
  payload: IUpdateWorkLogPayload,
) => {
  const workLog =
    await prisma.workLog.findFirst({
      where: {
        id: workLogId,
        booking: {
          providerId: userId,
        },
      },
    });

  if (!workLog) {
    throw new Error(
      "Work log not found or you don't have permission",
    );
  }

  if (workLog.completedAt) {
    throw new Error(
      "Completed work log cannot be updated",
    );
  }

  const updatedWorkLog =
    await prisma.workLog.update({
      where: {
        id: workLogId,
      },
      data: {
        title: payload.title,
        description: payload.description,
        startedAt: payload.startedAt
          ? new Date(payload.startedAt)
          : undefined,
      },
      include: {
        booking: {
          include: {
            serviceRequest: {
              include: {
                service: true,
              },
            },
          },
        },
      },
    });

  return updatedWorkLog;
};

const deleteWorkLog = async (
  userId: string,
  workLogId: string,
) => {
  const workLog =
    await prisma.workLog.findFirst({
      where: {
        id: workLogId,
        booking: {
          providerId: userId,
        },
      },
    });

  if (!workLog) {
    throw new Error(
      "Work log not found or you don't have permission",
    );
  }

  if (workLog.completedAt) {
    throw new Error(
      "Completed work log cannot be deleted",
    );
  }

  await prisma.workLog.delete({
    where: {
      id: workLogId,
    },
  });

  return null;
};

const completeWorkLog = async (
  userId: string,
  workLogId: string,
) => {
  const workLog =
    await prisma.workLog.findFirst({
      where: {
        id: workLogId,
        booking: {
          providerId: userId,
        },
      },
      include: {
        booking: true,
      },
    });

  if (!workLog) {
    throw new Error(
      "Work log not found or you don't have permission",
    );
  }

  if (workLog.completedAt) {
    throw new Error(
      "Work log is already completed",
    );
  }

  if (
    workLog.booking.status !==
    BookingStatus.IN_PROGRESS
  ) {
    throw new Error(
      "Booking must be in progress before completing the work",
    );
  }

  const result =
    await prisma.$transaction(
      async (tx) => {
        const completedWorkLog =
          await tx.workLog.update({
            where: {
              id: workLogId,
            },
            data: {
              completedAt: new Date(),
            },
            include: {
              booking: {
                include: {
                  serviceRequest: {
                    include: {
                      service: true,
                    },
                  },
                  customer: {
                    omit: {
                      password: true,
                    },
                  },
                  provider: {
                    omit: {
                      password: true,
                    },
                  },
                },
              },
            },
          });

        await tx.booking.update({
          where: {
            id: workLog.bookingId,
          },
          data: {
            status: BookingStatus.COMPLETED,
          },
        });

        return completedWorkLog;
      },
    );

  return result;
};

export const WorkLogService = {
  createWorkLog,
  getMyWorkLogs,
  getWorkLogsByBooking,
  updateWorkLog,
  deleteWorkLog,
  completeWorkLog,
};