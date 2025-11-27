import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { prismaClient } from "../../db/client.js";

export async function handleRegister(req, res) {
	const { username, password } = req.body;

	const userExists = await prismaClient.user.findFirst({ where: { username } });

	console.log();

	if (userExists)
		return res
			.status(409)
			.json({ message: "User with that Username already exists" });

	const hashedPassword = await bcrypt.hash(password, 10);

	const createdUser = await prismaClient.user.create({
		data: { username, password: hashedPassword },
	});

	return res.status(201).json({ user: { id: createdUser.id, username } });
}

export async function handleLogin(req, res) {
	const { username, password } = req.body;
	if (!username || !password)
		return res
			.status(400)
			.json({ message: "Username and Password are required" });
	const userExists = await prismaClient.user.findFirst({ where: { username } });

	if (!userExists) return res.status(401).json();

	const matchPasswords = await bcrypt.compare(password, userExists.password);

	if (!matchPasswords) return res.status(401).json();

	const accessToken = jwt.sign(
		{ userId: userExists.id },
		process.env.ACCESS_TOKEN_SECRET,
		{
			expiresIn: 60 * 60 * 24 * 30, // one month
		},
	);


	res.status(200).json({ accessToken });
}

