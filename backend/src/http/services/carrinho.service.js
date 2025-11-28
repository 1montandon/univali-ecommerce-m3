import { prismaClient } from "../db/client.js";

export async function validarEstoque(produtoId, quantidadeSolicitada) {
  // Validações básicas
  if (!produtoId || !quantidadeSolicitada) {
    throw new Error("ID do produto e quantidade são obrigatórios");
  }

  if (quantidadeSolicitada <= 0) {
    throw new Error("Quantidade deve ser maior que zero");
  }

  // Consultar estoque atual no banco de dados
  const produto = await prismaClient.produto.findUnique({
    where: { id: parseInt(produtoId) },
    select: {
      id: true,
      titulo: true,
      estoque: true,
      preco: true,
    },
  });

  // Verificar se o produto existe
  if (!produto) {
    throw new Error("Produto não encontrado");
  }

  // Validar se há estoque suficiente
  if (quantidadeSolicitada > produto.estoque) {
    const erro = new Error("Estoque insuficiente");
    erro.statusCode = 400;
    erro.estoque = produto.estoque;
    erro.solicitado = quantidadeSolicitada;
    throw erro;
  }

  // Retornar dados do produto se validação passou
  return {
    id: produto.id,
    titulo: produto.titulo,
    estoque: produto.estoque,
    preco: produto.preco,
    quantidadeValida: quantidadeSolicitada,
  };
}

export async function validarMultiplosProdutos(itens) {
  // Valida um array de { produtoId, quantidade }
  const resultados = [];
  const erros = [];

  for (const item of itens) {
    try {
      const validacao = await validarEstoque(item.produtoId, item.quantidade);
      resultados.push(validacao);
    } catch (erro) {
      erros.push({
        produtoId: item.produtoId,
        quantidade: item.quantidade,
        mensagem: erro.message,
        estoque: erro.estoque,
      });
    }
  }

  return { validos: resultados, erros };
}