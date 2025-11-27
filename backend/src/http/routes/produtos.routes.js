import { Router } from "express";
import { detalharProduto, listarProdutos } from "../controllers/produtos.routes.js";


const produtosRoutes = Router();

produtosRoutes.get('/', listarProdutos)
produtosRoutes.get('/:id', detalharProduto)

export default produtosRoutes;
