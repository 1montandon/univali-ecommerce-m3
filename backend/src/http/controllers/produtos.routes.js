import {
  listarProdutosService,
  detalharProdutoService,
} from "../services/produtos.services.js";

export async function listarProdutos(req, res) {
  try {
    const { categoria, q } = req.query;

    const produtos = await listarProdutosService({ categoria, q });

    return res.status(200).json(produtos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensagem: "Erro ao listar produtos" });
  }
}

export async function detalharProduto(req, res) {
  try {
    const id = Number(req.params.id);

    const produto = await detalharProdutoService(id);

    if (!produto) {
      return res.status(404).json({
        mensagem: "Produto não encontrado",
        idProduto: id,
      });
    }

    return res.status(200).json(produto);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensagem: "Erro ao buscar produto" });
  }
}
