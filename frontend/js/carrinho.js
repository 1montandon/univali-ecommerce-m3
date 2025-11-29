import { apiFetch } from "./api.js";

(async function () {
  "use strict";

  const container = document.getElementById("lista-carrinho");
  const totalGeralEl = document.getElementById("total-geral");

  carregarCarrinho();

  async function carregarCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

    if (carrinho.length === 0) {
      container.innerHTML = `
        <p class="text-[#617589] text-base">Seu carrinho está vazio.</p>
      `;
      totalGeralEl.textContent = "R$ 0,00";
      return;
    }

    container.innerHTML = "";

    let totalGeral = 0;

    for (const item of carrinho) {
      const resp = await apiFetch(`/produtos/${item.produtoId}`);
      const produto = await resp.json();

      const subtotal = produto.preco * item.quantidade;
      totalGeral += subtotal;

      const card = document.createElement("div");
      card.className =
        "flex items-center justify-between bg-[#f5f5f5] rounded-lg p-4";

      card.innerHTML = `
        <div class="flex items-center gap-4">
          <div class="w-20 h-20 bg-white rounded-lg p-2">
            <img src="${
              produto.imagemUrl
            }" class="w-full h-full object-contain" />
          </div>

          <div>
            <p class="text-[#111418] text-base font-medium">${
              produto.titulo
            }</p>
            <p class="text-[#617589] text-sm">Preço: R$ ${produto.preco}</p>
            <p class="text-[#617589] text-sm">Qtd: ${item.quantidade}</p>
            <p class="text-[#111418] font-bold">Subtotal: R$ ${subtotal.toFixed(
              2
            )}</p>
          </div>
        </div>

        <div>
<button class="text-red-600 hover:text-red-800 less-item">
          <span class="material-symbols-outlined"> remove </span>
        </button>
                <button class="text-red-600 hover:text-red-800 remove-item">
          <span class="material-symbols-outlined"> delete </span>
        </button>

        </div>

        
      `;

      card.querySelector(".remove-item").addEventListener("click", () => {
        removerItem(item.produtoId);
      });

      card.querySelector(".less-item").addEventListener("click", () => {
        diminuirItem(item.produtoId);
      });

      container.appendChild(card);
    }

    totalGeralEl.textContent = `R$ ${totalGeral.toFixed(2)}`;
  }

  function removerItem(produtoId) {
    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

    carrinho = carrinho.filter((p) => p.produtoId !== produtoId);

    localStorage.setItem("carrinho", JSON.stringify(carrinho));

    carregarCarrinho();
  }
  function diminuirItem(produtoId) {
    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

    const index = carrinho.findIndex((p) => p.produtoId === produtoId);
    if (index === -1) return;

    if (carrinho[index].quantidade > 1) {
      carrinho[index].quantidade -= 1;
    } else {
      carrinho.splice(index, 1);
    }

    localStorage.setItem("carrinho", JSON.stringify(carrinho));

    carregarCarrinho();
  }
})();
