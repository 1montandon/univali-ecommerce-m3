import { apiFetch } from "./api.js";

(function () {
  const resumoItens = document.getElementById("resumo-itens");
  const resumoTotal = document.getElementById("resumo-total");
  const form = document.getElementById("checkout-form");

  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

  // Se o carrinho estiver vazio
  if (carrinho.length === 0) {
    resumoItens.innerHTML = "<p class='text-[#617589]'>Carrinho vazio.</p>";
  } else {
    carregarResumo();
  }

  // Carregar resumo com detalhes do produto
  async function carregarResumo() {
    let total = 0;
    resumoItens.innerHTML = "";

    for (const item of carrinho) {
      const res = await apiFetch(`/produtos/${item.produtoId}`);
      const produto = await res.json();

      const subtotal = produto.preco * item.quantidade;
      total += subtotal;

      const div = document.createElement("div");
      div.className = "flex justify-between items-center";

      div.innerHTML = `
        <p class="text-[#111418]">${produto.titulo} (x${item.quantidade})</p>
        <span class="text-[#617589]">$${subtotal.toFixed(2)}</span>
      `;

      resumoItens.appendChild(div);
    }

    resumoTotal.textContent = `$${total.toFixed(2)}`;
  }

  // Finalizar pedido
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;

    try {
      const resposta = await apiFetch("/pedidos/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: {
          nome,
          email,
          itens: carrinho,
        },
      });

      const json = await resposta.json();

      if (!json.sucesso) {
        alert(`❌ Erro ao finalizar: ${json.mensagem}`);
        return;
      }

      // sucesso -> mostrar modal
      document.getElementById("pedido-id").textContent = json.dados.pedidoId;
      document.getElementById("modal-sucesso").classList.remove("hidden");

      // limpar carrinho
      localStorage.removeItem("carrinho");
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar pedido.");
    }
  });
})();
