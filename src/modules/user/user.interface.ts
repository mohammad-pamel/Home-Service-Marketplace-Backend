import { Router } from "express";
import { auth } from "../../middlewares/checkAuth";
import { upload } from "../../lib/multer";
import { Role } from "../../generated/prisma/enums";
import { UserController } from "./user.controller";
// import { Role } from "../../../generated/prisma/enums";
// import { upload } from "../../lib/multer";
// import { auth } from "../../middleware/checkAuth";
// import { UserController } from "./user.controller";

const router = Router();

router.patch(
	"/profile-image",
	auth(Role.ADMIN, Role.PROVIDER, Role.CUSTOMER),
	upload.single("profileImage"),
	UserController.uploadProfileImage,
);

export const UserRoutes = router;