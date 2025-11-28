import { Router } from "express";
import {
  validarEstoqueController,
} from "../controllers/carrinho.controller.js";
import { verifyJWT } from "../middleware/verify-jwt.js";

const carrinhoRoutes = Router();

// POST /api/carrinho/validar - Valida estoque de um produto
carrinhoRoutes.post("/validar", verifyJWT, validarEstoqueController);

export default carrinhoRoutes;