# **UNIVERSIDADE DO VALE DO ITAJAÍ – UNIVALI**

### **Disciplina:** Programação Web

### **Professor(a):** Welington Gadelha

## **Trabalho M3 – Projeto de E-commerce**

Ao longo do semestre vocês trabalharam com:

* Modularização de algoritmos
* Programação no lado cliente (bibliotecas de funções, objetos embutidos do navegador, formulários, eventos e fluxo assíncrono com JavaScript)
* Programação no lado servidor com persistência de dados

Neste trabalho de M3, você irá evoluir o e-commerce fake construído em aula com a FakeStore API para um sistema completo com:

* Back-end próprio
* Banco MySQL
* Front-end dinâmico

---

# **Objetivo**

Desenvolver uma aplicação web de e-commerce que:

* Consuma os produtos da FakeStore API
* Persista os dados em um banco MySQL próprio
* Implemente o fluxo completo de compra:
  **catálogo → carrinho → checkout → registro de pedidos**
* Exiba e controle o estoque em tempo real
* Permita consultar “minhas compras” (cliente)

O sistema deve demonstrar habilidades de: modularização de algoritmos, programação cliente (DOM, eventos, formulários, async) e servidor com persistência.

---

# **Requisitos do Back-end**

Tecnologias: **Node.js**, **Express**, **MySQL**

Banco deve ter, no mínimo, as tabelas:

* **Produtos**
* **Pedidos**
* **ItensPedido**
* **Clientes**

(Modelagem livre)

---

## **Importação da FakeStore API**

Criar uma rotina (ativada por endpoint) que:

* Consuma `/products` da FakeStore API
* Converta para o modelo da tabela Produtos
* Insira ou atualize dados no MySQL
* Defina um estoque inicial (fixo ou calculado)

---

## **Endpoints obrigatórios**

### **1. Listar produtos**

Retornar, para cada produto:

* id
* título
* preço
* categoria
* imagem_url
* estoque atual

Filtros opcionais:

* categoria
* trecho do nome/título

---

### **2. Detalhar produto**

Retornar todos os dados incluindo estoque atual.

---

### **3. Validação de estoque ao adicionar ao carrinho**

Endpoint deve:

* Consultar o estoque atual no banco
* Considerar concorrência (múltiplos usuários comprando ao mesmo tempo)
* Validação deve ser sempre no banco, não no front-end

---

### **4. Criar pedido**

Recebe: itens selecionados + dados do cliente

Fluxo:

1. Revalidar estoque com base nas quantidades finais
2. Se faltar estoque → retornar erro e **não** criar pedido
3. Caso ok →

   * Criar registro em **Pedidos**
   * Criar registros em **ItensPedido**
   * Atualizar estoque dos produtos (decremento)

---

### **5. Listar minhas compras**

Retornar todos os pedidos de um cliente.

---

## **Organização obrigatória (Back-end)**

* Separar:
  **rotas → controllers → serviços/repositórios → acesso ao banco**
* Evidenciar modularização

---

# **Requisitos do Front-end**

Tecnologias permitidas:

* HTML
* CSS
* JavaScript
* Bootstrap, Tailwind ou similar (opcional)

---

# **Telas mínimas**

### **1. Catálogo de produtos**

Exibir:

* imagem
* nome
* preço
* categoria
* estoque atual

Permitir:

* filtrar por categoria
* buscar por texto
* botão “Adicionar ao carrinho” com validação via back-end

---

### **2. Detalhes do produto**

Exibir:

* imagem destacada
* título
* descrição
* preço
* categoria
* estoque atual

Permitir adicionar ao carrinho (com validação no back-end).

---

### **3. Carrinho de compras**

Exibir lista com:

* nome
* quantidade
* preço unitário
* subtotal

Permitir:

* alterar quantidade (ideal revalidando estoque)
* remover itens
* botão **“Ir para checkout”** (desabilitar se vazio)

---

### **4. Checkout**

Formulário:

* nome
* e-mail

Exibir:

* resumo do carrinho

Botão:

* **Finalizar compra** → enviar para o back-end

Resultado:

* Exibir **confirmação de sucesso** (ex.: número do pedido)
* Ou **erro** (ex.: estoque insuficiente)

---

### **5. Minhas compras**

* Campo: digitar e-mail do cliente
* Exibir lista de pedidos com:

  * data
  * valor total
  * produtos de cada pedido

---

# **Requisitos de Código e Organização**

### **Modularização**

* **Back-end:** rotas, controllers, serviços, banco
* **Front-end:** separar funções e arquivos (ex.: módulo carrinho, módulo catálogo)

### **Persistência**

* Produtos, pedidos e itens devem estar no MySQL
* Nada só em memória

### **Boas práticas**

* Tratamento de erros no back-end
* Retornar códigos HTTP adequados
* Mensagens amigáveis no front-end

---

# **Entrega**

* Enviar o projeto em um repositório GitHub

* Incluir **README.md** com:

  * descrição do projeto
  * lista de tecnologias

* Publicar o link no AVA (atividade M3)

