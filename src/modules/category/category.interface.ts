
export interface ICreateCategoryPayload {
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export interface IUpdateCategoryPayload {
  name?: string;
  slug?: string;
  description?: string;
  image?: string;
  isActive?: boolean;
}

