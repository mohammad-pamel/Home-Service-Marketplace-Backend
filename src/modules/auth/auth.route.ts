import { Router } from "express";
import { AuthController } from "./auth.controller";
import { auth } from "../../middlewares/checkAuth";
import { Role } from "../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";
import { AuthValidation } from "./auth.validation";

const router = Router();

router.post("/register", AuthController.registerUser);
router.post("/verify-email", validateRequest(AuthValidation.CustomerEmailVerifyZodSchema), AuthController.verifyCustomerEmail);
router.post("/login", AuthController.loginUser);
router.get("/me", auth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN), AuthController.getMe);
router.patch("/me", auth( Role.CUSTOMER, Role.PROVIDER, Role.ADMIN, ), AuthController.updateMyProfile);
router.post("/refresh-token", AuthController.refreshToken);
router.post("/logout", AuthController.logout);
router.post("/google", AuthController.googleLogin)
router.post("/forgot-password", validateRequest(AuthValidation.ForgotPasswordZodSchema), AuthController.forgotPassword)
router.post("/reset-password", validateRequest(AuthValidation.ResetPasswordZodSchema), AuthController.resetPassword)

export const AuthRoutes = router;