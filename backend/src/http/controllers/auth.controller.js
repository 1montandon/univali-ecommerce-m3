import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { prismaClient } from "../../db/client.js";

export async function handleRegister(req, res) {
  const { email, password } = req.body;

  const userExists = await prismaClient.user.findFirst({ where: { email } });

  console.log();

  if (userExists)
    return res
      .status(409)
      .json({ message: "User with that Email already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const createdUser = await prismaClient.user.create({
    data: { email, password: hashedPassword },
  });

  return res.status(201).json({ user: { id: createdUser.id, email } });
}

export async function handleLogin(req, res) {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Missing email or password" });
  const userExists = await prismaClient.user.findFirst({ where: { email } });

  if (!userExists)
    return res.status(401).json({ message: "Invalid email or password" });

  const matchPasswords = await bcrypt.compare(password, userExists.password);

  if (!matchPasswords) return res.status(401).json();

  const accessToken = jwt.sign(
    { userId: userExists.id },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: 60 * 60 * 24 * 30, // one month
    }
  );

  res.status(200).json({ accessToken });
}
