import { Router } from "express";
import {
  criarPedidoController,
  obterPedidoController,
  listarPedidosClienteController,
} from "../controllers/pedidos.controller.js";
import { verifyJWT } from "../middleware/verify-jwt.js";

const pedidosRoutes = Router();

// POST /api/pedidos - Criar novo pedido
pedidosRoutes.post("/", verifyJWT, criarPedidoController);



// GET /api/pedidos/meus-pedidos - Listar pedidos do cliente autenticado (alternativa)
pedidosRoutes.get("/", verifyJWT, listarPedidosClienteController);

// GET /api/pedidos/:id - Obter detalhes de um pedido específico
pedidosRoutes.get("/:id", verifyJWT, obterPedidoController);

export default pedidosRoutes;