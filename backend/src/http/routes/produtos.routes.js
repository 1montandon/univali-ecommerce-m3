import { Router } from "express";
import { detalharProduto, listarProdutos } from "../controllers/produtos.controller.js";
import { verifyJWT } from "../middleware/verify-jwt.js";


const produtosRoutes = Router();

produtosRoutes.get('/', verifyJWT, listarProdutos)
produtosRoutes.get('/:id', detalharProduto)

export default produtosRoutes;
