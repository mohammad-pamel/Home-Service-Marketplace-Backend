export interface ICreateWorkLogPayload {
  bookingId: string;
  title: string;
  description?: string;
  startedAt?: string;
}

export interface IUpdateWorkLogPayload {
  title?: string;
  description?: string;
  startedAt?: string;
}