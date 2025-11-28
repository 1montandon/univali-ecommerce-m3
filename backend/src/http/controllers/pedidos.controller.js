import {
  criarPedido,
  obterPedido,
  listarPedidosCliente,
  listarPedidosPorEmail,
} from "../services/pedidos.services.js";

export async function criarPedidoController(req, res) {
  try {
    const { cliente, itens } = req.body;

    // Validação de entrada
    if (!cliente) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Dados do cliente são obrigatórios",
        dados: null,
      });
    }

    if (!itens) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Lista de itens é obrigatória",
        dados: null,
      });
    }

    // Chamar service para criar pedido
    const pedidoCriado = await criarPedido(cliente, itens);

    return res.status(201).json({
      sucesso: true,
      mensagem: "Pedido criado com sucesso",
      dados: pedidoCriado,
    });
  } catch (erro) {
    console.error("Erro ao criar pedido:", erro.message);

    const statusCode = erro.statusCode || 500;
    const mensagem = erro.message || "Erro ao criar pedido";

    // Se houver erros de estoque, retornar com detalhes
    if (erro.erros) {
      return res.status(statusCode).json({
        sucesso: false,
        mensagem,
        dados: {
          erros: erro.erros,
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

    return res.status(200).json({
      sucesso: true,
      mensagem: "Pedido encontrado",
      dados: pedido,
    });
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
    const { email } = req.user;

    if (!email) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Erro ao identificar o cliente",
        dados: null,
      });
    }

    const resultado = await listarPedidosCliente(email);

    if (!resultado.cliente) {
      return res.status(200).json({
        sucesso: true,
        mensagem: "Este cliente não tem pedidos registrados",
        dados: {
          cliente: null,
          total: 0,
          pedidos: [],
        },
      });
    }

    return res.status(200).json({
      sucesso: true,
      mensagem:
        resultado.pedidos.length > 0
          ? "Pedidos encontrados"
          : "Este cliente não tem pedidos",
      dados: {
        cliente: resultado.cliente,
        total: resultado.pedidos.length,
        pedidos: resultado.pedidos,
      },
    });
  } catch (erro) {
    console.error("Erro ao listar pedidos:", erro.message);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao listar pedidos",
      dados: null,
    });
  }
}

export async function listarPedidosPorEmailController(req, res) {
  try {
    const { email } = req.query;

    // Validar se email foi fornecido
    if (!email) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Parâmetro 'email' é obrigatório",
        dados: null,
      });
    }

    // Validar formato básico do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Formato de email inválido",
        dados: null,
      });
    }

    const resultado = await listarPedidosPorEmail(email);

    if (!resultado.cliente) {
      return res.status(200).json({
        sucesso: true,
        mensagem: "Cliente não encontrado ou sem pedidos",
        dados: {
          cliente: null,
          total: 0,
          pedidos: [],
        },
      });
    }

    return res.status(200).json({
      sucesso: true,
      mensagem:
        resultado.pedidos.length > 0
          ? "Pedidos encontrados"
          : "Este cliente não tem pedidos",
      dados: {
        cliente: resultado.cliente,
        total: resultado.pedidos.length,
        pedidos: resultado.pedidos,
      },
    });
  } catch (erro) {
    console.error("Erro ao listar pedidos por email:", erro.message);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao listar pedidos",
      dados: null,
    });
  }
}