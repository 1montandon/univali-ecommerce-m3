import { prismaClient } from "../../db/client.js";

export async function validarEstoque(produtoId, quantidadeSolicitada) {
  // Consultar estoque atual no banco de dados
  const produto = await prismaClient.produto.findUnique({
    where: { id: produtoId },
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

