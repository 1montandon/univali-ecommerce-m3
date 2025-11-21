import { Router } from "express";
import {
	handleLogin,
	handleLogout,
	handleRefreshToken,
	handleRegister,
} from "../controllers/auth.controller.js";

const authRoutes = Router();

authRoutes.post("/register", handleRegister);
authRoutes.post("/login", handleLogin);
authRoutes.post("/refresh", handleRefreshToken);
authRoutes.post("/logout", handleLogout);

export default authRoutes;
