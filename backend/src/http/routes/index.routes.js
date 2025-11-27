import { Router } from "express";
import { verifyJWT } from "../middleware/verify-jwt.js";
import authRoutes from "./auth.routes.js";
import produtosRoutes from "./produtos.routes.js";

const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/produtos", produtosRoutes)

routes.use(verifyJWT);

export default routes;
