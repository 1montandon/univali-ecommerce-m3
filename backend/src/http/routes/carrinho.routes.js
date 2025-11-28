import { Router } from "express";
import {
  validarEstoqueController,
  validarMultiplosController,
} from "../controllers/carrinho.controller.js";
import { verifyJWT } from "../middleware/verify-jwt.js";

const carrinhoRoutes = Router();

// POST /api/carrinho/validar - Valida estoque de um produto
carrinhoRoutes.post("/validar", verifyJWT, validarEstoqueController);

// POST /api/carrinho/validar-multiplos - Valida estoque de vários produtos
carrinhoRoutes.post("/validar-multiplos", verifyJWT, validarMultiplosController);

export default carrinhoRoutes;