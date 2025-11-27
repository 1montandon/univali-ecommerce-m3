import { prismaClient } from "../../db/client.js";

export async function listarProdutosService({ categoria, q }) {
  const where = {};

  if (categoria) {
    where.categoria = { equals: categoria };
  }

  if (q) {
    where.titulo = { contains: q };
  }

  return prismaClient.produto.findMany({
    where,
    select: {
      id: true,
      titulo: true,
      preco: true,
      categoria: true,
      imagemUrl: true,
      estoque: true,
    },
  });
}

export async function detalharProdutoService(id) {
  return prismaClient.produto.findFirst({
    where: { id },
  });
}
