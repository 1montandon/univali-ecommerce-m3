import { Router } from "express";
import {
  criarPedidoController,
  obterPedidoController,
  listarPedidosClienteController,
  listarPedidosPorEmailController,
} from "../controllers/pedidos.controller.js";
import { verifyJWT } from "../middleware/verify-jwt.js";

const pedidosRoutes = Router();

// POST /api/pedidos - Criar novo pedido
pedidosRoutes.post("/", verifyJWT, criarPedidoController);

// GET /api/pedidos?email=cliente@email.com - Listar pedidos por email (público)
pedidosRoutes.get("/", listarPedidosPorEmailController);

// GET /api/pedidos/meus-pedidos - Listar pedidos do cliente autenticado (alternativa)
pedidosRoutes.get("/meus-pedidos", verifyJWT, listarPedidosClienteController);

// GET /api/pedidos/:id - Obter detalhes de um pedido específico
pedidosRoutes.get("/:id", verifyJWT, obterPedidoController);

export default pedidosRoutes;