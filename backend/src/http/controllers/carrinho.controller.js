import { validarEstoque } from "../services/carrinho.services.js";

export async function validarEstoqueController(req, res) {
  try {
    const { produtoId, quantidade } = req.body;

    // Validação básica de entrada
    if (!produtoId || !quantidade) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "produtoId e quantidade são obrigatórios",
        dados: null,
      });
    }

    // Chamar o service para validar
    const resultado = await validarEstoque(
      Number(produtoId),
      Number(quantidade)
    );

    return res.status(200).json({
      sucesso: true,
      mensagem: "Estoque validado com sucesso",
      dados: resultado,
    });
  } catch (erro) {
    console.error("Erro ao validar estoque:", erro.message);

    const statusCode = erro.statusCode || 500;
    const mensagem = erro.message || "Erro ao validar estoque";

    return res.status(statusCode).json({
      sucesso: false,
      mensagem,
      dados: {
        estoque: erro.estoque,
        solicitado: erro.solicitado,
      },
    });
  }
}
