export interface ICreateServicePayload {
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  durationMinutes: number;
}

export interface IUpdateServicePayload {
  categoryId?: string;
  name?: string;
  slug?: string;
  description?: string;
  basePrice?: number;
  durationMinutes?: number;
  isActive?: boolean;
}

export interface IServiceQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
