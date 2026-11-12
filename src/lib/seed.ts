
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import {
  AuthProvider,
  Role,
  UserStatus,
} from "../../src/generated/prisma/enums";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Creating demo accounts...");

  const demoAccounts = [
    {
      name: "Demo Admin",
      email: "admin.demo@homeservice.com",
      password: "DemoAdmin@123",
      role: Role.ADMIN,
    },
    {
      name: "Demo Customer",
      email: "customer.demo@homeservice.com",
      password: "DemoCustomer@123",
      role: Role.CUSTOMER,
    },
    {
      name: "Demo Provider",
      email: "provider.demo@homeservice.com",
      password: "DemoProvider@123",
      role: Role.PROVIDER,
    },
  ];

  const createdUsers = [];

  for (const account of demoAccounts) {
    const hashedPassword = await bcrypt.hash(account.password, 10);

    const user = await prisma.user.upsert({
      where: { email: account.email },
      update: {
        name: account.name,
        password: hashedPassword,
        role: account.role,
        status: UserStatus.ACTIVE,
        authProvider: AuthProvider.CREDENTIAL,
        emailVerified: true,
        needPasswordChange: false,
      },
      create: {
        name: account.name,
        email: account.email,
        password: hashedPassword,
        role: account.role,
        status: UserStatus.ACTIVE,
        authProvider: AuthProvider.CREDENTIAL,
        emailVerified: true,
        needPasswordChange: false,
      },
    });

    createdUsers.push(user);

    if (account.role === Role.CUSTOMER) {
      await prisma.customer.upsert({
        where: { email: account.email },
        update: {
          name: account.name,
          userId: user.id,
          isDeleted: false,
          deletedAt: null,
        },
        create: {
          name: account.name,
          email: account.email,
          userId: user.id,
        },
      });
    }

    if (account.role === Role.PROVIDER) {
      await prisma.serviceProviderProfile.upsert({
        where: { userId: user.id },
        update: {
          bio: "Demo service provider account",
          experienceYears: 3,
          isVerified: true,
          serviceArea: "Chattogram",
        },
        create: {
          userId: user.id,
          bio: "Demo service provider account",
          experienceYears: 3,
          isVerified: true,
          serviceArea: "Chattogram",
        },
      });
    }

    console.log(`Created/updated: ${account.email}`);
  }

  console.log("\nDemo accounts are ready!");
  console.table(
    createdUsers.map((user) => ({
      name: user.name,
      email: user.email,
      role: user.role,
    })),
  );
}

main()
  .catch((error) => {
    console.error("Demo seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
