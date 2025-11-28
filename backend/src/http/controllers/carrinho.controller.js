import { validarEstoque, validarMultiplosProdutos } from "../services/carrinho.services.js";

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
    const resultado = await validarEstoque(produtoId, quantidade);

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

export async function validarMultiplosController(req, res) {
  try {
    const { itens } = req.body;

    // Validação de entrada
    if (!Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "itens deve ser um array não vazio",
        dados: null,
      });
    }

    // Validar cada item
    const resultado = await validarMultiplosProdutos(itens);

    // Se houver erros, retornar com status 207 (Multi-Status)
    const statusCode = resultado.erros.length > 0 ? 207 : 200;

    return res.status(statusCode).json({
      sucesso: resultado.erros.length === 0,
      mensagem:
        resultado.erros.length === 0
          ? "Todos os produtos validados com sucesso"
          : `${resultado.validos.length} validados, ${resultado.erros.length} com erro`,
      dados: {
        validos: resultado.validos,
        erros: resultado.erros,
      },
    });
  } catch (erro) {
    console.error("Erro ao validar múltiplos produtos:", erro.message);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao validar estoque",
      dados: null,
    });
  }
}