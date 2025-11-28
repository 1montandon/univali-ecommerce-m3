import { prismaClient } from "../db/client.js";

export async function criarPedido(dadosCliente, itens) {
  // Validações iniciais
  if (!dadosCliente?.nome || !dadosCliente?.email) {
    throw new Error("Nome e email do cliente são obrigatórios");
  }

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
  }

  // Revalidar estoque de todos os itens antes de iniciar transação
  await revalidarEstoqueMultiplos(itens);

  // Usar transação Prisma para garantir atomicidade
  const pedido = await prismaClient.$transaction(async (tx) => {
    // 1. Criar ou buscar cliente
    const cliente = await tx.cliente.upsert({
      where: { email: dadosCliente.email },
      update: { nome: dadosCliente.nome },
      create: {
        nome: dadosCliente.nome,
        email: dadosCliente.email,
      },
    });

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
        cliente_id: cliente.id,
        total: parseFloat(total.toFixed(2)),
      },
    });

    // 4. Criar registros em `itens_pedido` e atualizar estoque
    for (const item of itensComDetalhes) {
      // Criar item do pedido
      await tx.item_pedido.create({
        data: {
          pedido_id: pedidoNovo.id,
          produto_id: parseInt(item.produtoId),
          quantidade: item.quantidade,
          preco_unit: parseFloat(item.preco.toFixed(2)),
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
        nome: cliente.nome,
        email: cliente.email,
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

async function revalidarEstoqueMultiplos(itens) {
  // Revalidar todos os produtos antes de iniciar transação
  const produtosIds = itens.map((item) => parseInt(item.produtoId));

  const produtos = await prismaClient.produto.findMany({
    where: { id: { in: produtosIds } },
    select: { id: true, titulo: true, estoque: true },
  });

  // Criar mapa para busca rápida
  const mapaProdutos = new Map(produtos.map((p) => [p.id, p]));

  // Validar cada item
  const erros = [];
  for (const item of itens) {
    const produtoId = parseInt(item.produtoId);
    const produto = mapaProdutos.get(produtoId);

    if (!produto) {
      erros.push({
        produtoId,
        quantidade: item.quantidade,
        mensagem: "Produto não encontrado",
      });
      continue;
    }

    if (item.quantidade > produto.estoque) {
      erros.push({
        produtoId,
        titulo: produto.titulo,
        quantidade: item.quantidade,
        estoqueDisponivel: produto.estoque,
        mensagem: `Estoque insuficiente. Disponível: ${produto.estoque}`,
      });
    }
  }

  if (erros.length > 0) {
    const erro = new Error("Estoque insuficiente para um ou mais itens");
    erro.statusCode = 400;
    erro.erros = erros;
    throw erro;
  }
}

export async function obterPedido(pedidoId) {
  const pedido = await prismaClient.pedido.findUnique({
    where: { id: parseInt(pedidoId) },
    include: {
      cliente: {
        select: { id: true, nome: true, email: true },
      },
      itens_pedido: {
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
    itens: pedido.itens_pedido.map((item) => ({
      produtoId: item.produto_id,
      titulo: item.produto.titulo,
      quantidade: item.quantidade,
      precoUnit: parseFloat(item.preco_unit),
      subtotal: parseFloat((item.quantidade * item.preco_unit).toFixed(2)),
    })),
    total: parseFloat(pedido.total),
  };
}

export async function listarPedidosCliente(emailCliente) {
  // Buscar cliente pelo email
  const cliente = await prismaClient.cliente.findUnique({
    where: { email: emailCliente },
    include: {
      pedidos: {
        include: {
          itens_pedido: {
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

  // Formatear respuesta con todos los detalles
  const pedidos = cliente.pedidos.map((pedido) => ({
    id: pedido.id,
    numero: `PED-${String(pedido.id).padStart(6, "0")}`,
    data: pedido.data,
    total: parseFloat(pedido.total),
    quantidadeItens: pedido.itens_pedido.reduce(
      (acc, item) => acc + item.quantidade,
      0
    ),
    produtos: pedido.itens_pedido.map((item) => ({
      id: item.produto.id,
      nome: item.produto.titulo,
      quantidade: item.quantidade,
      precoUnitario: parseFloat(item.preco_unit),
      subtotal: parseFloat(
        (item.quantidade * parseFloat(item.preco_unit)).toFixed(2)
      ),
    })),
  }));

  return {
    cliente: {
      id: cliente.id,
      nome: cliente.nome,
      email: cliente.email,
    },
    pedidos,
  };
}

export async function listarPedidosPorEmail(emailCliente) {
  // Alias para listarPedidosCliente (compatibilidade com query param)
  return listarPedidosCliente(emailCliente);
}