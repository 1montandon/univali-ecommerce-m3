import { Router } from "express";
import { verifyJWT } from "../middleware/verify-jwt.js";
import authRoutes from "./auth.routes.js";

const routes = Router();

routes.use("/auth", authRoutes);
routes.use(verifyJWT);

export default routes;
