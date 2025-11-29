import { apiFetch } from "./api.js";

(async function () {
  "use strict";

  const container = document.getElementById("pedidos-container");
  const emptyEl = document.getElementById("pedidos-empty");
  const errorEl = document.getElementById("pedidos-error");

  let pedidos = [];

  // Buscar pedidos do backend
  async function carregarPedidos() {
    container.innerHTML = `<p class="text-[#617589]">Carregando pedidos...</p>`;
    emptyEl.classList.add("hidden");
    errorEl.classList.add("hidden");

    try {
      const res = await apiFetch("/pedidos");
      pedidos = await res.json();

      if (!Array.isArray(pedidos) || pedidos.length === 0) {
        container.innerHTML = "";
        emptyEl.classList.remove("hidden");
        return;
      }

      renderPedidos(pedidos);
    } catch (err) {
      console.error("Erro ao buscar pedidos:", err);
      container.innerHTML = "";
      errorEl.classList.remove("hidden");
    }
  }

  // Renderizar lista (aceita filtro)
  function renderPedidos(list) {
    container.innerHTML = "";

    // Ordena por data decrescente (caso não venha ordenado)
    list
      .slice()
      .forEach((p) => {
        const card = document.createElement("div");
        card.className = "bg-white rounded-lg p-4 shadow flex flex-col gap-3";

        const data = new Date(p.data);
        const dataFormatada = data.toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        // header do pedido
        const header = document.createElement("div");
        header.className = "flex items-center justify-between";

        header.innerHTML = `
          <div class="flex flex-col">
            <div class="text-[#111418] font-semibold">Pedido #${p.id}</div>
            <div class="text-[#617589] text-sm">Data: ${dataFormatada}</div>
            <div class="text-[#617589] text-sm">Itens: ${p.quantidadeItens}</div>
          </div>

          <div class="flex items-center gap-4">
            <div class="text-[#111418] font-bold">R$ ${Number(p.total).toFixed(2)}</div>
            <button class="px-3 py-1 rounded-lg bg-[#f0f2f4] text-[#111418] toggle-produtos">
              <span class="material-symbols-outlined"> expand_more </span>
            </button>
          </div>
        `;

        // lista de produtos (inicialmente oculta)
        const produtosList = document.createElement("div");
        produtosList.className = "mt-2 hidden flex-col gap-2";
        produtosList.innerHTML = p.produtos
          .map(
            (prod) => `
            <div class="flex items-center justify-between bg-[#f8f9fa] p-3 rounded-lg">
              <div class="flex flex-col max-w-[70%]">
                <div class="text-[#111418] font-medium">${prod.nome}</div>
                <div class="text-[#617589] text-sm">Qtd: ${prod.quantidade} • R$ ${Number(prod.precoUnitario).toFixed(2)}</div>
              </div>
              <div class="text-[#111418] font-semibold">R$ ${Number(prod.subtotal).toFixed(2)}</div>
            </div>
          `
          )
          .join("");

        // anexar
        card.appendChild(header);
        card.appendChild(produtosList);

        // toggle
        header.querySelector(".toggle-produtos").addEventListener("click", () => {
          const isHidden = produtosList.classList.contains("hidden");
          produtosList.classList.toggle("hidden", !isHidden);

          // trocar ícone
          const icon = header.querySelector(".material-symbols-outlined");
          if (icon) icon.textContent = isHidden ? "expand_less" : "expand_more";
        });

        container.appendChild(card);
      });
  }


  // init
  carregarPedidos();
})();
