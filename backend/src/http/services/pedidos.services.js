import { prismaClient } from "../../db/client.js";
import { validarEstoque } from "./carrinho.services.js";

export async function criarPedido(userId, itens) {
  if (!Array.isArray(itens) || itens.length === 0) {
    throw new Error("Pedido deve conter pelo menos um item");
  }

  // Validar estrutura dos itens
  for (const item of itens) {
    if (!item.produtoId || !item.quantidade) {
      throw new Error("Cada item deve conter produtoId e quantidade");
    }
    if (item.quantidade <= 0) {
      throw new Error("Quantidade deve ser maior que zero");
    }
    await validarEstoque(item.produtoId, item.quantidade);
  }

  const pedido = await prismaClient.$transaction(async (tx) => {
    // 1. Criar ou buscar cliente
    const cliente = await tx.user.findUnique({
      where: { id: Number(userId) },
    });

    console.log(cliente);

    if (!cliente) {
      throw new Error(`Cliente com ID ${userId} não existe`);
    }

    // 2. Calcular total do pedido
    const itensComDetalhes = await Promise.all(
      itens.map(async (item) => {
        const produto = await prismaClient.produto.findUnique({
          where: { id: parseInt(item.produtoId) },
          select: { preco: true },
        });
        return {
          ...item,
          preco: parseFloat(produto.preco),
        };
      })
    );

    const total = itensComDetalhes.reduce(
      (acc, item) => acc + item.preco * item.quantidade,
      0
    );

    // 3. Criar registro em `pedidos`
    const pedidoNovo = await tx.pedido.create({
      data: {
        data: new Date(),
        clienteId: Number(userId),
        total: parseFloat(total.toFixed(2)),
      },
    });

    // 4. Criar registros em `itens_pedido` e atualizar estoque
    for (const item of itensComDetalhes) {
      // Criar item do pedido
      await tx.itensPedido.create({
        data: {
          pedidoId: pedidoNovo.id,
          produtoId: parseInt(item.produtoId),
          quantidade: item.quantidade,
          precoUnit: parseFloat(item.preco.toFixed(2)),
        },
      });

      // Decrementar estoque do produto
      await tx.produto.update({
        where: { id: parseInt(item.produtoId) },
        data: {
          estoque: {
            decrement: item.quantidade,
          },
        },
      });
    }

    // 5. Retornar dados completos do pedido
    return {
      id: pedidoNovo.id,
      numero: `PED-${String(pedidoNovo.id).padStart(6, "0")}`,
      data: pedidoNovo.data,
      cliente: {
        id: cliente.id,
        nome: cliente.username,
      },
      itens: itensComDetalhes.map((item) => ({
        produtoId: item.produtoId,
        quantidade: item.quantidade,
        precoUnit: item.preco,
        subtotal: parseFloat((item.preco * item.quantidade).toFixed(2)),
      })),
      total: parseFloat(total.toFixed(2)),
    };
  });

  return pedido;
}

export async function obterPedido(pedidoId) {
  const pedido = await prismaClient.pedido.findUnique({
    where: { id: parseInt(pedidoId) },
    include: {
      cliente: {
        select: { id: true, username: true },
      },
      itens: {
        include: {
          produto: {
            select: { id: true, titulo: true },
          },
        },
      },
    },
  });

  if (!pedido) {
    throw new Error("Pedido não encontrado");
  }

  return {
    id: pedido.id,
    numero: `PED-${String(pedido.id).padStart(6, "0")}`,
    data: pedido.data,
    cliente: pedido.cliente,
    itens: pedido.itens.map((item) => ({
      produtoId: item.produto_id,
      titulo: item.produto.titulo,
      quantidade: item.quantidade,
      precoUnit: parseFloat(item.precoUnit),
      subtotal: parseFloat((item.quantidade * item.precoUnit).toFixed(2)),
    })),
    total: parseFloat(pedido.total),
  };
}

export async function listarPedidosCliente(userId) {
  // Buscar cliente pelo email
  const cliente = await prismaClient.user.findUnique({
    where: { id: userId },
    include: {
      pedidos: {
        include: {
          itens: {
            include: {
              produto: {
                select: { id: true, titulo: true },
              },
            },
          },
        },
        orderBy: { data: "desc" },
      },
    },
  });

  if (!cliente) {
    return {
      cliente: null,
      pedidos: [],
    };
  }

  console.log(JSON.stringify(cliente));

  // Formatear respuesta con todos los detalles
  const pedidos = cliente.pedidos.map((pedido) => ({
    id: pedido.id,
    data: pedido.data,
    total: parseFloat(pedido.total),
    quantidadeItens: pedido.itens.reduce(
      (acc, item) => acc + item.quantidade,
      0
    ),
    produtos: pedido.itens.map((item) => ({
      id: item.produto.id,
      nome: item.produto.titulo,
      quantidade: item.quantidade,
      precoUnitario: parseFloat(item.precoUnit),
      subtotal: parseFloat(
        (item.quantidade * parseFloat(item.precoUnit)).toFixed(2)
      ),
    })),
  }));

  return {
    pedidos,
  };
}
