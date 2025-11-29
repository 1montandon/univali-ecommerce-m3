import { apiFetch } from "./api.js";

(async function () {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    document.getElementById("produto-container").innerHTML =
      "<p class='text-red-500'>Produto inválido.</p>";
    return;
  }

  try {
    const resposta = await apiFetch(`/produtos/${id}`);
    const produto = await resposta.json();

    renderProduto(produto);
  } catch (e) {
    console.error(e);
    document.getElementById("produto-container").innerHTML =
      "<p class='text-red-500'>Erro ao carregar produto.</p>";
  }

  function renderProduto(p) {
    const container = document.getElementById("produto-container");

    container.innerHTML = `
      <div class="flex flex-col md:flex-row gap-8">

        <!-- Imagem -->
        <div class="flex-1 bg-[#f5f5f5] p-4 rounded-lg h-[400px] flex items-center justify-center">
          <img src="${p.imagemUrl}" alt="${p.titulo}" class="object-contain w-full h-full" />
        </div>

        <!-- Detalhes -->
        <div class="flex-1 flex flex-col gap-4">
          <h2 class="text-2xl font-bold text-[#111418]">${p.titulo}</h2>

          <p class="text-[#617589]">${p.descricao}</p>

          <p class="text-lg font-semibold text-[#111418]">Preço: $${p.preco}</p>

          <p class="text-[#617589]">Categoria: ${p.categoria}</p>

          <p class="text-[#617589]">Estoque disponível: ${p.estoque}</p>

          <button id="add-carrinho"
            class="flex items-center gap-2 bg-[#111418] text-white px-4 py-2 rounded-lg hover:bg-black transition">
            <span class="material-symbols-outlined"> add_shopping_cart </span>
            Adicionar ao Carrinho
          </button>
        </div>
      </div>
    `;

    document.getElementById("add-carrinho").addEventListener("click", () => {
      adicionarAoCarrinho(p.id);
    });
  }

  function adicionarAoCarrinho(produtoId) {
    const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
    const itemExistente = carrinho.find((item) => item.produtoId === produtoId);
    const novaQuantidade = itemExistente ? itemExistente.quantidade + 1 : 1;

    apiFetch("/carrinho/validar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: ({
        produtoId,
        quantidade: novaQuantidade,
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (!json.sucesso) {
          alert(`❌ Estoque insuficiente. Disponível: ${json.dados?.estoque}`);
          return;
        }

        if (itemExistente) {
          itemExistente.quantidade = novaQuantidade;
        } else {
          carrinho.push({ produtoId, quantidade: 1 });
        }

        localStorage.setItem("carrinho", JSON.stringify(carrinho));

        alert("✔️ Adicionado ao carrinho!");
      })
      .catch(() => {
        alert("Erro ao adicionar ao carrinho!");
      });
  }
})();
