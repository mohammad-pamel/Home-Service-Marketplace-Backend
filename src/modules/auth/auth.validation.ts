import z from "zod";

const RegisterUserZodSchema = z.object({
    name: z
        .string("Name must be a string")
        .min(3, "Name must be at least 3 characters long")
        .max(100, "Name cannot exceed 100 characters"),

    email: z
        .email("Invalid email address"),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .regex(
            /[a-z]/,
            "Password must contain at least 1 lowercase letter",
        )
        .regex(
            /[A-Z]/,
            "Password must contain at least 1 uppercase letter",
        )
        .regex(
            /[0-9]/,
            "Password must contain at least 1 number",
        )
        .regex(
            /[^A-Za-z0-9]/,
            "Password must contain at least 1 special character",
        ),

    phone: z
        .string()
        .min(10, "Phone number must be at least 10 characters")
        .max(20, "Phone number is invalid"),

    role: z
        .enum(["CUSTOMER", "PROVIDER"])
        .optional(),
});

const LoginZodSchema = z.object({
    email: z.email("Invalid email address"),

    password: z
        .string()
        .min(1, "Password is required"),
});

const UpdateProfileZodSchema = z.object({ 
    name: z 
    .string("Name must be a string") 
    .min(3, "Name must be at least 3 characters long") 
    .max(100, "Name cannot exceed 100 characters") 
    .optional(), 
    
    phone: z 
    .string("Phone must be a string") 
    .min(10, "Phone number must be at least 10 characters") 
    .max(20, "Phone number is invalid") 
    .optional(), 
    
    profileImage: z 
    .string("Profile image must be a string") 
    .url("Invalid profile image URL") 
    .optional(), 
});

const RefreshTokenZodSchema = z.object({
    refreshToken: z
        .string()
        .min(1, "Refresh token is required"),
});

const ForgotPasswordZodSchema = z.object({
    email: z.email(),
});

const ResetPasswordZodSchema = z.object({
    email: z.email(),
    newPassword: z
        .string()
        .min(8, "Password Must Minimum 8 Characters Long.")
        .regex(/[a-z]/, "Password must contain atleast 1 Lowercase Letter")
        .regex(/[A-Z]/, "Password must contain atleast 1 Uppercase Letter")

        .regex(/[0-9]/, "Password must contain atleast 1 Number")
        .regex(/[^A-Za-z0-9]/, "Password must contain atleast 1 Special Character"),
    otp: z.string().length(6),
});


export const AuthValidation = {
    RegisterUserZodSchema,
    LoginZodSchema,
    UpdateProfileZodSchema,
    RefreshTokenZodSchema,
    ForgotPasswordZodSchema,
    ResetPasswordZodSchema,
};