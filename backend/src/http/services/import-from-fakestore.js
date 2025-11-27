import { prismaClient } from "../../db/client.js";
export async function importProductsFromFakeStore() {
  const response = await fetch("https://fakestoreapi.com/products");
  const products = await response.json();

  for (const p of products) {
    await prismaClient.produto.upsert({
      where: {
        id: p.id,
      },
      update: {
        titulo: p.title,
        preco: p.price,
        descricao: p.description,
        categoria: p.category,
        imagemUrl: p.image,
      },
      create: {
        id: p.id,
        titulo: p.title,
        preco: p.price,
        descricao: p.description,
        categoria: p.category,
        imagemUrl: p.image,
        estoque: 100,
      },
    });
  }

  console.log("✔ Produtos importados/atualizados no MySQL");
}
