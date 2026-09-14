export interface ICreateServiceRequestPayload {
  serviceId: string;
  title: string;
  description: string;
  address: string;
  city?: string;
  area?: string;
  latitude?: number;
  longitude?: number;
  preferredDate?: string;
  preferredTime?: string;
}

export interface IUpdateServiceRequestPayload {
  title?: string;
  description?: string;
  address?: string;
  city?: string;
  area?: string;
  latitude?: number;
  longitude?: number;
  preferredDate?: string;
  preferredTime?: string;
}