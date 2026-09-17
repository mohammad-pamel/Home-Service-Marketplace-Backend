import {
    BookingStatus,
    EstimateStatus,
} from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import {
    ICreateEstimatePayload,
    IUpdateEstimatePayload,
} from "./estimate.interface";

const calculateEstimate = (
    items: {
        quantity: number;
        unitPrice: number;
    }[],
    tax = 0,
    discount = 0,
) => {
    const subtotal = items.reduce(
        (sum, item) =>
            sum + item.quantity * item.unitPrice,
        0,
    );

    const total = subtotal + tax - discount;

    if (total < 0) {
        throw new Error(
            "Discount cannot be greater than subtotal plus tax",
        );
    }

    return {
        subtotal,
        tax,
        discount,
        total,
    };
};

const createEstimate = async (
    userId: string,
    payload: ICreateEstimatePayload,
) => {
    const booking = await prisma.booking.findFirst({
        where: {
            id: payload.bookingId,
            providerId: userId,
        },

        include: {
            estimate: true,
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

    if (booking.estimate) {
        throw new Error(
            "An estimate already exists for this booking",
        );
    }

    if (booking.status === BookingStatus.CANCELLED) {
        throw new Error(
            "Cannot create estimate for a cancelled booking",
        );
    }

    if (booking.status === BookingStatus.COMPLETED) {
        throw new Error(
            "Cannot create estimate for a completed booking",
        );
    }

    const tax = payload.tax ?? 0;
    const discount = payload.discount ?? 0;

    const calculation = calculateEstimate(
        payload.items,
        tax,
        discount,
    );

    if (
        payload.expiresAt &&
        new Date(payload.expiresAt) <= new Date()
    ) {
        throw new Error(
            "Estimate expiration must be in the future",
        );
    }

    const estimate = await prisma.$transaction(
        async (tx) => {
            const createdEstimate =
                await tx.estimate.create({
                    data: {
                        bookingId: booking.id,
                        subtotal: calculation.subtotal,
                        tax: calculation.tax,
                        discount: calculation.discount,
                        total: calculation.total,
                        status: EstimateStatus.SENT,
                        notes: payload.notes,
                        expiresAt: payload.expiresAt
                            ? new Date(payload.expiresAt)
                            : undefined,

                        items: {
                            create: payload.items.map((item) => ({
                                description: item.description,
                                quantity: item.quantity,
                                unitPrice: item.unitPrice,
                                total:
                                    item.quantity * item.unitPrice,
                            })),
                        },
                    },

                    include: {
                        items: true,
                        booking: {
                            include: {
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
                                serviceRequest: {
                                    include: {
                                        service: true,
                                    },
                                },
                            },
                        },
                    },
                });

            return createdEstimate;
        },
    );

    return estimate;
};

const getMyProviderEstimates = async (
    userId: string,
) => {
    return prisma.estimate.findMany({
        where: {
            booking: {
                providerId: userId,
            },
        },

        include: {
            items: true,
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
};

const getMyCustomerEstimates = async (
    userId: string,
) => {
    return prisma.estimate.findMany({
        where: {
            booking: {
                customerId: userId,
            },
        },

        include: {
            items: true,
            booking: {
                include: {
                    serviceRequest: {
                        include: {
                            service: true,
                            location: true,
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

        orderBy: {
            createdAt: "desc",
        },
    });
};

const getEstimateById = async (
    userId: string,
    estimateId: string,
) => {
    const estimate = await prisma.estimate.findFirst({
        where: {
            id: estimateId,

            OR: [
                {
                    booking: {
                        customerId: userId,
                    },
                },
                {
                    booking: {
                        providerId: userId,
                    },
                },
            ],
        },

        include: {
            items: true,

            booking: {
                include: {
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

                    serviceRequest: {
                        include: {
                            service: true,
                            location: true,
                        },
                    },
                },
            },
        },
    });

    if (!estimate) {
        throw new Error("Estimate not found");
    }

    return estimate;
};

const updateEstimate = async (
    userId: string,
    estimateId: string,
    payload: IUpdateEstimatePayload,
) => {
    const existingEstimate =
        await prisma.estimate.findFirst({
            where: {
                id: estimateId,
                booking: {
                    providerId: userId,
                },
            },

            include: {
                items: true,
            },
        });

    if (!existingEstimate) {
        throw new Error(
            "Estimate not found or you don't have permission",
        );
    }

    if (existingEstimate.status !== EstimateStatus.DRAFT &&
        existingEstimate.status !== EstimateStatus.SENT) {
        throw new Error(
            "This estimate can no longer be updated",
        );
    }

    const items = payload.items
        ? payload.items
        : existingEstimate.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
        }));

    const tax =
        payload.tax ??
        Number(existingEstimate.tax);

    const discount =
        payload.discount ??
        Number(existingEstimate.discount);

    const calculation = calculateEstimate(
        items,
        tax,
        discount,
    );

    const updatedEstimate =
        await prisma.$transaction(async (tx) => {
            if (payload.items) {
                await tx.estimateItem.deleteMany({
                    where: {
                        estimateId: estimateId,
                    },
                });
            }

            return tx.estimate.update({
                where: {
                    id: estimateId,
                },

                data: {
                    subtotal: calculation.subtotal,
                    tax: calculation.tax,
                    discount: calculation.discount,
                    total: calculation.total,
                    notes: payload.notes,
                    expiresAt: payload.expiresAt
                        ? new Date(payload.expiresAt)
                        : undefined,

                    ...(payload.items && {
                        items: {
                            create: payload.items.map((item) => ({
                                description: item.description,
                                quantity: item.quantity,
                                unitPrice: item.unitPrice,
                                total:
                                    item.quantity * item.unitPrice,
                            })),
                        },
                    }),
                },

                include: {
                    items: true,
                },
            });
        });

    return updatedEstimate;
};

const approveEstimate = async (
    userId: string,
    estimateId: string,
) => {
    const estimate = await prisma.estimate.findFirst({
        where: {
            id: estimateId,
            booking: {
                customerId: userId,
            },
        },
    });

    if (!estimate) {
        throw new Error("Estimate not found");
    }

    if (estimate.status !== EstimateStatus.SENT) {
        throw new Error(
            "Only sent estimates can be approved",
        );
    }

    if (
        estimate.expiresAt &&
        estimate.expiresAt <= new Date()
    ) {
        await prisma.estimate.update({
            where: {
                id: estimateId,
            },
            data: {
                status: EstimateStatus.EXPIRED,
            },
        });

        throw new Error("This estimate has expired");
    }

    return prisma.estimate.update({
        where: {
            id: estimateId,
        },

        data: {
            status: EstimateStatus.APPROVED,
        },

        include: {
            items: true,
        },
    });
};

const rejectEstimate = async (
    userId: string,
    estimateId: string,
) => {
    const estimate = await prisma.estimate.findFirst({
        where: {
            id: estimateId,
            booking: {
                customerId: userId,
            },
        },
    });

    if (!estimate) {
        throw new Error("Estimate not found");
    }

    if (estimate.status !== EstimateStatus.SENT) {
        throw new Error(
            "Only sent estimates can be rejected",
        );
    }

    return prisma.estimate.update({
        where: {
            id: estimateId,
        },

        data: {
            status: EstimateStatus.REJECTED,
        },

        include: {
            items: true,
        },
    });
};

export const EstimateService = {
    createEstimate,
    getMyProviderEstimates,
    getMyCustomerEstimates,
    getEstimateById,
    updateEstimate,
    approveEstimate,
    rejectEstimate,
};