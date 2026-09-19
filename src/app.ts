import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import config from "./config";
import { success } from "zod";
import { notFound } from "./middlewares/notFound";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { AuthRoutes } from "./modules/auth/auth.route";
import { CategoryRoutes } from "./modules/category/category.routes";
import { ServiceRoutes } from "./modules/service/service.routes";
import { ProviderRoutes } from "./modules/provider/provider.routes";
import { ProviderServiceRoutes } from "./modules/providerService/providerService.routes";
import { AvailabilityRoutes } from "./modules/availability/availability.routes";
import { ServiceRequestRoutes } from "./modules/service-request/service-request.routes";
import { AssignmentRoutes } from "./modules/assignment/assignment.routes";
import { BookingRoutes } from "./modules/booking/booking.routes";
import { EstimateRoutes } from "./modules/estimate/estimate.routes";
import { PaymentRoutes } from "./modules/payment/payment.routes";
import { WorkLogRoutes } from "./modules/work-log/work-log.routes";
import { ReviewRoutes } from "./modules/review/review.routes";
import { UserRoutes } from "./modules/user/user.interface";
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
app.use("/api/v1/user", UserRoutes);
app.use("/api/v1/categories", CategoryRoutes);
app.use("/api/v1/services", ServiceRoutes);
app.use("/api/v1/providers", ProviderRoutes);
app.use("/api/v1/provider-services", ProviderServiceRoutes);
app.use("/api/v1/availability", AvailabilityRoutes);
app.use("/api/v1/service-requests", ServiceRequestRoutes);
app.use("/api/v1/assignments", AssignmentRoutes);
app.use("/api/v1/bookings", BookingRoutes);
app.use("/api/v1/estimates", EstimateRoutes);
app.use("/api/v1/payments", PaymentRoutes);
app.use("/api/v1/work-logs", WorkLogRoutes);
app.use("/api/v1/reviews", ReviewRoutes);


app.use(globalErrorHandler);
app.use(notFound);

export default app;
