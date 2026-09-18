import { Role } from "../../generated/prisma/enums";

export interface IRegisterUserPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
  role?: Role;
  customer: {
		contactNumber?: string;
	};
}

export interface IVerifyEmailPayload {
	email: string;
	otp: string;
}

export interface ILoginUserPayload {
  email: string;
  password: string;
}

export interface IRegisterCustomerPayload {
	name: string;
	email: string;
	password: string;
	customer: {
		contactNumber?: string;
	};
}

export interface IRefreshTokenPayload {
  refreshToken: string;
}

export interface IRequestUser {
  userId: string;
  name: string;
  email: string;
  role: Role;
}

export interface IGoogleLoginPayload {
	idToken: string;
}

export interface IUpdateProfilePayload {
     name?: string; 
     phone?: string; 
     imageUrl?: string; 
    }

export interface IForgotPasswordPayload {
	email: string;
}
export interface IResetPasswordPayload {
	email: string;
	newPassword: string;
	otp: string;
}