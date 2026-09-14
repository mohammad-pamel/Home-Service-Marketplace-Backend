import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import config from "./config";
// import { AuthRoutes } from "./module/auth/auth.route";
import { success } from "zod";
import { notFound } from "./middlewares/notFound";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { AuthRoutes } from "./modules/auth/auth.route";
import { CategoryRoutes } from "./modules/category/category.routes";
import { ServiceRoutes } from "./modules/service/service.routes";
// import { redisClient } from "./lib/redis";

const app: Application = express();

app.use(
	cors({
		origin: config.frontend_url,
		credentials: true,
	}),
);

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

// app.use("/api/v1/auth", AuthRoutes);

// app.get('/test', async(req : Request, res : Response, next : NextFunction) => {
// 	try {

// 		await redisClient.set("forgot-password-otp:patient1@gmail.com", "123456", {
// 			expiration : {
// 				type : "EX",
// 				value : 60 
// 			}
// 		})
	
// 		res.status(httpStatus.OK).json({
// 		success : true,
// 		message : "Welcome to PH Heathcare System Backend",
// 		data : null
// 	})
// 	// next()
// 	} catch (error) {
// 		next(error)
// 	}
// })

// Basic route
app.get("/", async (req: Request, res: Response) => {
	res.status(httpStatus.OK).json({
		success: true,
		message: "Welcome to Home Service Marketplace System Backend",
	});
});

app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/categories", CategoryRoutes);
app.use("/api/v1/services", ServiceRoutes);


app.use(globalErrorHandler);
app.use(notFound);

export default app;
