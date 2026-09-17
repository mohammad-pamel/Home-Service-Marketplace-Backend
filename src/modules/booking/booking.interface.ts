export interface ICreateBookingPayload {
  serviceRequestId: string;
  scheduledAt: string;
}

export interface IUpdateBookingPayload {
  scheduledAt?: string;
}