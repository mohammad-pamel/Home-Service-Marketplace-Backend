export interface ICreateProviderServicePayload {
  serviceId: string;
  price?: number;
}

export interface IUpdateProviderServicePayload {
  price?: number;
}