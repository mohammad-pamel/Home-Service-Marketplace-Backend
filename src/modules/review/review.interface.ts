export interface ICreateReviewPayload {
  bookingId: string;
  rating: number;
  comment?: string;
}

export interface IUpdateReviewPayload {
  rating?: number;
  comment?: string;
}

export interface IUpdateReviewStatusPayload {
  status: "PUBLISHED" | "HIDDEN";
}