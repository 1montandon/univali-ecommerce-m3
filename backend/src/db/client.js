import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../db/client/client.ts";

const adapter = new PrismaMariaDb({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "yanMonta",
	database: "univali_ecommerce",
});

export const prismaClient = new PrismaClient({
	log: ["error", "info", "query", "warn"],
	adapter,
});
