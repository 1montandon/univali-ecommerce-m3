import { apiFetch } from "./api.js";

(async function () {
  "use strict";

  const filtroTodas = document.getElementById("filtro-todas");
  const filtroRoupas = document.getElementById("filtro-roupas");
  const filtroJoias = document.getElementById("filtro-joias");
  const filtroEletronicos = document.getElementById("filtro-eletronicos");

  const filtrosBotoes = [
    filtroTodas,
    filtroRoupas,
    filtroJoias,
    filtroEletronicos,
  ];

  filtrosBotoes.forEach((btn) => {
    btn.classList.add("bg-[#f0f2f4]", "hover:bg-[#a6a6a6]");
    btn.addEventListener("click", () => {
      filtrosBotoes.forEach((b) => b.classList.add("bg-[#f0f2f4]"));
      btn.classList.remove("bg-[#f0f2f4]");
      btn.classList.add("bg-[#a6a6a6]");

      const categoria = btn.dataset.categoria || "";

      buscarProdutos(categoria);
    });
  });

  // Função para buscar produtos
  async function buscarProdutos(categoria = "") {
    try {
      const response = await apiFetch(`/produtos?categoria=${categoria}`);
      const produtos = await response.json();

      renderizarProdutos(produtos);
    } catch (e) {
      console.error("Erro ao buscar produtos:", e);
    }
  }

  // Função de exemplo para renderizar produtos
  function renderizarProdutos(lista) {
    const container = document.getElementById("lista-produtos");
    container.innerHTML = "";

    lista.forEach((p) => {
      const card = document.createElement("div");
      card.className = "flex flex-col gap-3 w-[300px] mb-10";

      // adiciona data-* no card
      card.dataset.id = p.id;
      card.dataset.categoria = p.categoria;

    card.innerHTML = `
    <div class="w-full h-[300px] p-4 rounded-lg overflow-hidden bg-[#f5f5f5] ">
  <img
    src="${p.imagemUrl}"
    alt="${p.titulo}"
    class="w-full h-full object-contain"
  />
</div>

    <div>
      <p class="text-[#111418] text-base font-medium leading-normal">
        ${p.titulo}
      </p>
      <div class="flex flex-row justify-between">
        <p class="text-[#617589] text-sm font-normal leading-normal">
        ${p.preco}
        </p>
        <div class="bg-[#f0f2f4] text-[#111418] text-smz hover:cursor-pointer rounded-lg p-2 add-carinho" >
        <span class="material-symbols-outlined">
          add_shopping_cart
        </span>
        </div>
      </div>
    </div>
    `;


    const btnAdd = card.querySelector(".add-carinho");

    btnAdd.addEventListener("click", () => {
        text(p.id)
    });
    

      container.appendChild(card);
    });
  }

  function text(id){
    console.log(id)
  }

  buscarProdutos();
})();
