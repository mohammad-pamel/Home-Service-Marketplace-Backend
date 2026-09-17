import bcrypt from "bcryptjs";
import { AuthProvider, Role, UserStatus } from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import {
    IForgotPasswordPayload,
    IGoogleLoginPayload,
    ILoginUserPayload,
    IRegisterUserPayload,
    IResetPasswordPayload,
    IUpdateProfilePayload,
} from "./auth.interface";
import { jwtUtils } from "../../utils/jwt";
import config from "../../config";
import { JwtPayload, SignOptions } from "jsonwebtoken";
import { TokenPayload } from "google-auth-library";
import { googleClient } from "../../lib/googleAuth";
import crypto from "crypto";
import ejs from "ejs";
import path from "path";
import { redisClient } from "../../lib/redis";
import { transporter } from "../../lib/nodemailer";

const registerUser = async (
    payload: IRegisterUserPayload,
) => {
    const { name, password, phone } = payload;

    const email = payload.email
        .trim()
        .toLowerCase();

    const isUserExists = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (isUserExists) {
        throw new Error(
            "User with this email already exists",
        );
    }

    const hashedPassword = await bcrypt.hash(
        password,
        10,
    );

    const createdUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            phone,
            role: payload.role ?? Role.CUSTOMER,
            status: UserStatus.ACTIVE,
        },

        omit: {
            password: true,
        },
    });

    const jwtPayload = {
        userId: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
    };

    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions,
    );

    const refreshToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_refresh_secret,
        config.jwt_refresh_expires_in as SignOptions,
    );

    return {
        user: createdUser,
        accessToken,
        refreshToken,
    };
};

const loginUser = async (
    payload: ILoginUserPayload,
) => {
    const { password } = payload;

    const email = payload.email
        .trim()
        .toLowerCase();

    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    if (user.status === UserStatus.BLOCKED) {
        throw new Error("User is blocked");
    }

    if (user.status === UserStatus.SUSPENDED) {
        throw new Error("User is suspended");
    }

    if (user.deletedAt) {
        throw new Error("User is deleted");
    }

    if (!user.password) {
        throw new Error(
            "This account does not have a password",
        );
    }

    const isPasswordMatched =
        await bcrypt.compare(
            password,
            user.password,
        );

    if (!isPasswordMatched) {
        throw new Error("Invalid credentials");
    }

    const jwtPayload = {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };

    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions,
    );

    const refreshToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_refresh_secret,
        config.jwt_refresh_expires_in as SignOptions,
    );

    return {
        accessToken,
        refreshToken,
    };
};

const getMe = async (
    userId: string,
) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },

        omit: {
            password: true,
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    if (user.deletedAt) {
        throw new Error("User has been deleted");
    }

    return user;
};

const updateMyProfile = async (userId: string, payload: IUpdateProfilePayload) => {
    const user = await prisma.user.findUnique({
         where: { 
            id: userId, 
        }, 
        }); 
        
        if (!user) { 
            throw new Error("User not found"); 
        } 
        
        if (user.deletedAt) { 
            throw new Error("User has been deleted"); 
        } 
        
        const updatedUser = await prisma.user.update({ 
            where: { 
                id: userId, 
            }, 
            data: { 
                name: payload.name, 
                phone: payload.phone, 
                imageUrl: payload.imageUrl, 
            }, 
            omit: { 
                password: true, 
            }, 
        }); 
        
        return updatedUser;
};

const refreshToken = async (
    token: string,
) => {
    const verifiedRefreshToken = jwtUtils.verifyToken(
        token,
        config.jwt_refresh_secret,
    );

    if (!verifiedRefreshToken.success || !verifiedRefreshToken.data) {
        throw new Error(
            config.node_env === "development"
                ? verifiedRefreshToken.error
                : "Invalid refresh token",
        );
    }

    const data = verifiedRefreshToken.data as JwtPayload;

    const user = await prisma.user.findUnique({
        where: { id: data.userId },
    });

    if (!user) {
        throw new Error("User not found");
    }

    if (user.deletedAt) {
        throw new Error("User has been deleted");
    }

    if (user.status !== UserStatus.ACTIVE) {
        throw new Error("User is not active");
    }

    const jwtPayload = {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };

    const newAccessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions,
    );

    const newRefreshToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_refresh_secret,
        config.jwt_refresh_expires_in as SignOptions,
    );

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    };
};

const googleLogin = async (payload: IGoogleLoginPayload) => {

    let googleIdTokenPayload: TokenPayload | null | undefined = null;

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: payload.idToken,
            audience: config.google_client_id
        })

        googleIdTokenPayload = ticket.getPayload()

    } catch (error) {
        console.log("Google ID Token Verification Failed", error);
        throw new Error("Invalid Or Expired ID Token error");
    }

    if (!googleIdTokenPayload) {
        throw new Error("Invalid Or Expired ID Token payload error");
    }

    if (!googleIdTokenPayload.email) {
        throw new Error("Google Email Not Found");
    }

    if (!googleIdTokenPayload.name) {
        throw new Error("Google Email Name Not Found");
    }

    const ifCustomerExistWithGoogleAuth = await prisma.user.findUnique({
        where: {
            email: googleIdTokenPayload.email,
            role: Role.CUSTOMER,
            googleId: googleIdTokenPayload.sub
        }
    })

    let user = ifCustomerExistWithGoogleAuth;

    if (!user) {

        const ifCustomerExistWithCredentials = await prisma.user.findUnique({
            where: {
                email: googleIdTokenPayload.email,
                role: Role.CUSTOMER,
                authProvider: AuthProvider.CREDENTIAL
            }
        })

        if (ifCustomerExistWithCredentials) {

            // if (!ifCustomerExistWithCredentials.emailVerified) {
            //     throw new Error("Email Not Verified");
            // }

            if (ifCustomerExistWithCredentials.status === UserStatus.BLOCKED) {
                throw new Error("User Is Blocked");
            }

            // if (ifCustomerExistWithCredentials.isDeleted || ifCustomerExistWithCredentials.status === UserStatus.DELETED) {
            //     throw new Error("User Is Deleted");
            // }

            user = await prisma.user.update({
                where: {
                    id: ifCustomerExistWithCredentials.id
                },

                data: {
                    googleId: googleIdTokenPayload.sub
                }
            })
        }
        else {
            user = await prisma.user.create({
                data: {
                    name: googleIdTokenPayload.name,
                    email: googleIdTokenPayload.email,
                    role: Role.CUSTOMER,
                    // emailVerified: true,
                    // googleId: googleIdTokenPayload.sub,
                    authProvider: AuthProvider.GOOGLE,
                    customer: {
                        create: {
                            name: googleIdTokenPayload.name,
                            email: googleIdTokenPayload.email
                        }
                    }

                }
            })
        }


    }

    if (user.status === UserStatus.BLOCKED) {
        throw new Error("User Is Blocked");
    }

    // if (user.isDeleted || user.status === UserStatus.DELETED) {
    //     throw new Error("User Is Deleted");
    // }

    const jwtPayload = {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };

    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions,
    );

    const refreshToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_refresh_secret,
        config.jwt_refresh_expires_in as SignOptions,
    );

    return {
        accessToken,
        refreshToken
    };


};

const forgotPassword = async (payload: IForgotPasswordPayload) => {
    const { email } = payload;

    const isUserExist = await prisma.user.findUnique({
        where: {
            email
        }
    })

    if (!isUserExist) {
        throw new Error("User Not Found");
    }

    if (isUserExist.status === "BLOCKED") {
        throw new Error("User is Blocked");
    }

    // if (!isUserExist.emailVerified) {
    //     throw new Error("User Not Verified");
    // }

    // if (isUserExist.isDeleted || isUserExist.status === "DELETED") {
    //     throw new Error("User is deleted");
    // }

    // if (isUserExist.googleId && isUserExist.authProvider === "GOOGLE") {
    //     throw new Error("User Has Account With Google");
    // }

    const otp = crypto.randomInt(100000, 1000000).toString();

    const key = `forgot-password-otp:${isUserExist.email}`;

    await redisClient.set(key, otp, {
        expiration: {
            type: "EX",
            value: 5 * 60
        }
    })

    const expirationSeconds = 5 * 60

    const tempatePath = path.join(process.cwd(), "src/app/templates/forgot-password.ejs");

    // const html = await ejs.renderFile(tempatePath, {
    // 	OTP: otp
    // })


    const templateData = {
        name: isUserExist.name,
        otp,
        expirationMinutes: expirationSeconds / 60,
    };

    const html = await ejs.renderFile(tempatePath, templateData);



    await transporter.sendMail({
        from: config.email_sender,
        to: isUserExist.email,
        subject: "Forgot Password",
        // text : `Your OTP is ${otp}`
        // html: `<h1>Your OTP is ${otp}</h1>`
        html,
    });
}

const resetPassword = async (payload: IResetPasswordPayload) => {

    const { email, otp, newPassword } = payload;

    const isUserExist = await prisma.user.findUnique({
        where: {
            email
        }
    })

    if (!isUserExist) {
        throw new Error("User Not Found");
    }

    if (isUserExist.status === "BLOCKED") {
        throw new Error("User is Blocked");
    }

    // if (!isUserExist.emailVerified) {
    //     throw new Error("User Not Verified");
    // }

    // if (isUserExist.isDeleted || isUserExist.status === "DELETED") {
    //     throw new Error("User is deleted");
    // }

    // if (isUserExist.googleId && isUserExist.authProvider === "GOOGLE") {
    //     throw new Error("User Has Account With Google");
    // }

    const key = `forgot-password-otp:${isUserExist.email}`;

    const redisOtp = await redisClient.get(key);

    if (!redisOtp) {
        throw new Error("Invalid OTP");
    }

    if (redisOtp !== otp) {
        throw new Error("OTP Does Not Matched");
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, Number(config.bcrypt_salt_rounds));

    await prisma.user.update({
        where: {
            email: isUserExist.email
        },
        data: {
            password: hashedNewPassword
        }
    })

    await redisClient.del([key]);




    const tempatePath = path.join(process.cwd(), "src/app/templates/reset-password-success.ejs");

    // const html = await ejs.renderFile(tempatePath, {
    // 	OTP: otp
    // })


    const templateData = {
        name: isUserExist.name
    };

    const html = await ejs.renderFile(tempatePath, templateData);

    await transporter.sendMail({
        from: config.email_sender,
        to: isUserExist.email,
        subject: "Password Changed",
        // text : `Your OTP is ${otp}`
        // html: `<h1>Your Password is Changed</h1>`
        html,
    });

}

export const AuthService = {
    registerUser,
    loginUser,
    getMe,
    updateMyProfile,
    refreshToken,
    googleLogin,
    forgotPassword,
    resetPassword
};