import { Request, Response } from "express";
import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

import { AuthService } from "./auth.service";
import { AuthValidation } from "./auth.validation";

const registerUser = catchAsync(
    async (req: Request, res: Response) => {
        const payload =
            AuthValidation.RegisterUserZodSchema.parse(
                req.body,
            );

        const result =
            await AuthService.registerUser(payload);

        const {
            accessToken,
            refreshToken,
            user,
        } = result;

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24,
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });

        sendResponse(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: "User registered successfully",
            data: {
                accessToken,
                refreshToken,
                user,
            },
        });
    },
);

const loginUser = catchAsync(
    async (req: Request, res: Response) => {
        const payload =
            AuthValidation.LoginZodSchema.parse(
                req.body,
            );

        const result =
            await AuthService.loginUser(payload);

        const {
            accessToken,
            refreshToken,
        } = result;

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24,
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "User logged in successfully",
            data: {
                accessToken,
                refreshToken,
            },
        });
    },
);

const getMe = catchAsync(
    async (req: Request, res: Response) => {
        if (!req.user) {
            throw new Error("User not authenticated");
        }

        const result =
            await AuthService.getMe(
                req.user.userId,
            );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "User profile retrieved successfully",
            data: result,
        });
    },
);

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
    const payload = AuthValidation.UpdateProfileZodSchema.parse(req.body,);
    const result = await AuthService.updateMyProfile(req.user!.userId, payload,);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Profile updated successfully",
        data: result
    });
},
);

const refreshToken = catchAsync(
    async (req: Request, res: Response) => {
        const token =
            req.cookies?.refreshToken ||
            req.body.refreshToken;

        if (!token) {
            throw new Error(
                "Refresh token is required",
            );
        }

        const result =
            await AuthService.refreshToken(token);

        res.cookie(
            "accessToken",
            result.accessToken,
            {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                maxAge:
                    1000 * 60 * 60 * 24,
            },
        );

        res.cookie(
            "refreshToken",
            result.refreshToken,
            {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                maxAge:
                    1000 * 60 * 60 * 24 * 7,
            },
        );

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message:
                "Access token refreshed successfully",
            data: result,
        });
    },
);

const logout = catchAsync(
    async (_req: Request, res: Response) => {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Logged out successfully",
            data: null,
        });
    },
);

const googleLogin = catchAsync(async (req: Request, res: Response) => {

    const payload = req.body;

    const result = await AuthService.googleLogin(payload);
    const { accessToken, refreshToken } = result;

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "New tokens generated successfully",
        data: {
            accessToken,
            refreshToken
        },
    });
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {

    const payload = req.body;

    const result = await AuthService.forgotPassword(payload);


    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `OTP Send To Email : ${payload.email}`,
        data: null,
    });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {

    const payload = req.body;

    await AuthService.resetPassword(payload);


    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Password Changed successfully",
        data: null
    });
});

export const AuthController = {
    registerUser,
    loginUser,
    getMe,
    updateMyProfile,
    refreshToken,
    logout,
    googleLogin,
    forgotPassword,
    resetPassword
};