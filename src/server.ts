import app from "./app";
import config from "./config";
import { transporter } from "./lib/nodemailer";
import { prisma } from "./lib/prisma";
import { redisClient } from "./lib/redis";
// import { seedSuperAdmin } from "./utils/seed";
// import { seedSuperAdmin } from "./app/utils/seed";

const PORT = config.port;

const main = async () => {
	try {
		await prisma.$connect();
		console.log("Connected to the database successfully.");
        console.log(PORT)

		await redisClient.connect();
		console.log("Connected to the redis successfully.");
		
		await transporter.verify();
		console.log("Connected to the nodemailer successfully.");


		// await seedSuperAdmin();

		app.listen(PORT, () => {
			console.log(`Server is running on port ${PORT}`);
		});
	} catch (error) {
		console.error("Error starting the server:", error);
		// await prisma.$disconnect();
		// process.exit(1);
	}
};

main();
