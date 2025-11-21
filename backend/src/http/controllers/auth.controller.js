import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { prismaClient } from "../../db/client.js";

export async function handleRegister(req, res) {
	const { username, password } = req.body;

	const userExists = await prismaClient.user.findFirst({ where: { username } });

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
			expiresIn: 60 * 15,
		},
	);

	const tokenId = randomUUID();
	const refreshToken = jwt.sign(
		{ userId: userExists.id, tokenId },
		process.env.REFRESH_TOKEN_SECRET,
		{
			expiresIn: "7d",
		},
	);

	await prismaClient.refreshToken.create({
		data: {
			id: tokenId,
			userId: userExists.id,
			expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
			ipAddress: req.ip,
			userAgent: req.get("user-agent"),
		},
	});

	res.cookie("refreshToken", refreshToken, {
		httpOnly: true,
		sameSite: "None",
		secure: true,
		maxAge: 24 * 60 * 60 * 7000,
	});
	res.status(200).json({ accessToken });
}

export async function handleLogout(req, res) {
	const cookies = req.cookies;

	if (!cookies?.refreshToken) return res.status(204).json();

	let decodedRefresh;
	try {
		decodedRefresh = jwt.verify(
			cookies.refreshToken,
			process.env.REFRESH_TOKEN_SECRET,
		);
	} catch (err) {
		res.clearCookie("refreshToken", {
			httpOnly: true,
			sameSite: "None",
			secure: true,
		});
		return res.status(204).json(); // token inválido, expirado ou forjado
	}

	// Buscar token no banco
	const dbToken = await prismaClient.refreshToken.findFirst({
		where: { id: decodedRefresh.tokenId },
	});

	if (!dbToken || dbToken.revokedAt || dbToken.expiresAt < new Date()) {
		res.clearCookie("refreshToken", {
			httpOnly: true,
			sameSite: "None",
			secure: true,
		});
		return res.status(204).json();
	}

	// ❗ Verifica se o token pertence ao mesmo usuário
	if (dbToken.userId !== decodedRefresh.userId) {
		return res.status(401).json();
	}

	await prismaClient.refreshToken.update({
		where: {
			id: decodedRefresh.tokenId,
		},
		data: {
			revokedAt: new Date(),
		},
	});

	res.clearCookie("refreshToken", {
		httpOnly: true,
		sameSite: "None",
		secure: true,
	});
	return res.status(204).json();
}

export async function handleRefreshToken(req, res) {
	const cookies = req.cookies;

	if (!cookies?.refreshToken) return res.status(401).json();

	let decodedRefresh;
	try {
		decodedRefresh = jwt.verify(
			cookies.refreshToken,
			process.env.REFRESH_TOKEN_SECRET,
		);
	} catch (err) {
		return res.status(401).json(); // token inválido, expirado ou forjado
	}

	// Buscar token no banco
	const dbToken = await prismaClient.refreshToken.findFirst({
		where: { id: decodedRefresh.tokenId },
	});

	if (!dbToken || dbToken.revokedAt || dbToken.expiresAt < new Date()) {
		return res.status(401).json();
	}

	// ❗ Verifica se o token pertence ao mesmo usuário
	if (dbToken.userId !== decodedRefresh.userId) {
		return res.status(401).json();
	}

	// Gerar novo access token
	const accessToken = jwt.sign(
		{ userId: decodedRefresh.userId },
		process.env.ACCESS_TOKEN_SECRET,
		{
			expiresIn: 60 * 15,
		},
	);

	res.status(200).json({ accessToken });
}
