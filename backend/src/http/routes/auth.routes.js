import { Router } from "express";
import {
	handleLogin,
	handleRegister,
} from "../controllers/auth.controller.js";

const authRoutes = Router();

authRoutes.post("/register", handleRegister);
authRoutes.post("/login", handleLogin);


export default authRoutes;
