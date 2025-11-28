import {
  criarPedido,
  obterPedido,
  listarPedidosCliente,
} from "../services/pedidos.services.js";

export async function criarPedidoController(req, res) {
  try {
    const { userId } = req;
    const { itens } = req.body;

    if (!itens) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Lista de itens é obrigatória",
        dados: null,
      });
    }
    // Chamar service para criar pedido
    const pedidoCriado = await criarPedido(Number(userId), itens);

    return res.status(201).json(pedidoCriado);
  } catch (erro) {
    console.error("Erro ao criar pedido:", erro.message);

    const statusCode = erro.statusCode || 500;
    const mensagem = erro.message || "Erro ao criar pedido";
    console.log(erro);
    // Se houver erros de estoque, retornar com detalhes
    if (erro) {
      return res.status(statusCode).json({
        sucesso: false,
        mensagem,
        dados: {
          estoque: erro.estoque,
          solicitado: erro.solicitado,
        },
      });
    }

    return res.status(statusCode).json({
      sucesso: false,
      mensagem,
      dados: null,
    });
  }
}

export async function obterPedidoController(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "ID do pedido é obrigatório",
        dados: null,
      });
    }

    const pedido = await obterPedido(id);

    return res.status(200).json(pedido);
  } catch (erro) {
    console.error("Erro ao obter pedido:", erro.message);

    const statusCode = erro.message.includes("não encontrado") ? 404 : 500;

    return res.status(statusCode).json({
      sucesso: false,
      mensagem: erro.message,
      dados: null,
    });
  }
}

export async function listarPedidosClienteController(req, res) {
  try {
    // Obter email do usuário autenticado (via JWT)
    const { userId } = req;

    const resultado = await listarPedidosCliente(userId);

    return res.status(200).json(resultado.pedidos);
  } catch (erro) {
    console.error("Erro ao listar pedidos:", erro.message);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao listar pedidos",
      dados: null,
    });
  }
}
