export interface IEstimateItemPayload {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface ICreateEstimatePayload {
  bookingId: string;
  tax?: number;
  discount?: number;
  notes?: string;
  expiresAt?: string;
  items: IEstimateItemPayload[];
}

export interface IUpdateEstimatePayload {
  tax?: number;
  discount?: number;
  notes?: string;
  expiresAt?: string;
  items?: IEstimateItemPayload[];
}