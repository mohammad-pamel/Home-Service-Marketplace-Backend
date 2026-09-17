import {
  AssignmentStatus,
  BookingStatus,
  ServiceRequestStatus,
} from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { ICreateBookingPayload, IUpdateBookingPayload } from "./booking.interface";


const createBooking = async (
  userId: string,
  payload: ICreateBookingPayload,
) => {
  const serviceRequest =
    await prisma.serviceRequest.findFirst({
      where: {
        id: payload.serviceRequestId,
        customerId: userId,
        deletedAt: null,
      },

      include: {
        service: true,
        location: true,

        assignments: {
          where: {
            status: AssignmentStatus.ACCEPTED,
          },

          include: {
            provider: {
              omit: {
                password: true,
              },
            },
          },
        },

        booking: true,
      },
    });

  if (!serviceRequest) {
    throw new Error("Service request not found");
  }

  if (serviceRequest.booking) {
    throw new Error(
      "A booking already exists for this service request",
    );
  }

  if (
    serviceRequest.status !== ServiceRequestStatus.ACCEPTED
  ) {
    throw new Error(
      "Service request must be accepted before creating a booking",
    );
  }

  const acceptedAssignment =
    serviceRequest.assignments[0];

  if (!acceptedAssignment) {
    throw new Error(
      "No provider has accepted this service request",
    );
  }

  const scheduledAt = new Date(payload.scheduledAt);

  if (scheduledAt <= new Date()) {
    throw new Error(
      "Scheduled date and time must be in the future",
    );
  }

 const booking = await prisma.$transaction(
  async (tx) => {
    const createdBooking = await tx.booking.create({
      data: {
        serviceRequestId: serviceRequest.id,
        customerId: userId,
        providerId: acceptedAssignment.providerId,
        locationId: serviceRequest.locationId,
        scheduledAt,
        status: BookingStatus.PENDING,
        totalAmount: serviceRequest.service.basePrice,
      },

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

        provider: {
          omit: {
            password: true,
          },
        },
      },
    });

    await tx.serviceRequest.update({
      where: {
        id: serviceRequest.id,
      },

      data: {
        status: ServiceRequestStatus.ACCEPTED,
      },
    });

    return createdBooking;
  },
);

  return booking;
};

const getMyBookings = async (userId: string) => {
  const bookings = await prisma.booking.findMany({
    where: {
      OR: [
        {
          customerId: userId,
        },
        {
          providerId: userId,
        },
      ],
    },

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

      provider: {
        omit: {
          password: true,
        },
      },

      estimate: true,
      invoice: true,
      payments: true,
      review: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return bookings;
};

const getBookingById = async (
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

      provider: {
        omit: {
          password: true,
        },
      },

      estimate: {
        include: {
          items: true,
        },
      },

      invoice: true,
      payments: true,
      workLogs: true,
      review: true,
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  return booking;
};

const updateBooking = async (
  userId: string,
  bookingId: string,
  payload: IUpdateBookingPayload,
) => {
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      customerId: userId,
    },
  });

  if (!booking) {
    throw new Error(
      "Booking not found or you don't have permission",
    );
  }

  if (
    booking.status === BookingStatus.COMPLETED ||
    booking.status === BookingStatus.CANCELLED
  ) {
    throw new Error(
      "Completed or cancelled bookings cannot be updated",
    );
  }

  if (!payload.scheduledAt) {
    throw new Error("Scheduled date and time is required");
  }

  const scheduledAt = new Date(payload.scheduledAt);

  if (scheduledAt <= new Date()) {
    throw new Error(
      "Scheduled date and time must be in the future",
    );
  }

  const updatedBooking = await prisma.booking.update({
    where: {
      id: bookingId,
    },

    data: {
      scheduledAt,
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

  return updatedBooking;
};

const cancelBooking = async (
  userId: string,
  bookingId: string,
) => {
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      customerId: userId,
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (
    booking.status === BookingStatus.COMPLETED ||
    booking.status === BookingStatus.CANCELLED
  ) {
    throw new Error(
      "This booking cannot be cancelled",
    );
  }

  const cancelledBooking =
    await prisma.booking.update({
      where: {
        id: bookingId,
      },

      data: {
        status: BookingStatus.CANCELLED,
      },
    });

  return cancelledBooking;
};

export const BookingService = {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
};