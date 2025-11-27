# 🛒 E-commerce UNIVALI - Backend

> Projeto acadêmico da disciplina **Programação Web** - UNIVALI  
> Professor: Welington Gadelha | Trabalho M3

Sistema de e-commerce completo com backend Node.js/Express, banco MySQL e integração com a FakeStore API.

---

## 📚 Sumário

- [Tecnologias](#-tecnologias)
- [Arquitetura do Projeto](#-arquitetura-do-projeto)
- [Entendendo o Prisma](#-entendendo-o-prisma)
- [Como Rodar o Projeto](#-como-rodar-o-projeto)
- [Endpoints da API](#-endpoints-da-api)
- [O que já está implementado](#-o-que-já-está-implementado)
- [TODO List](#-todo-list---o-que-falta-implementar)

---

## 🛠 Tecnologias

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| Node.js | - | Runtime JavaScript no servidor |
| Express | 5.1.0 | Framework web minimalista |
| Prisma | 7.0.0 | ORM moderno para banco de dados |
| MySQL | 8.0 | Banco de dados relacional |
| Docker | - | Containerização do banco |
| JWT | 9.0.2 | Autenticação via tokens |
| bcrypt | 6.0.0 | Hash de senhas |

---

## 📁 Arquitetura do Projeto

```
src/
├── server.js              # Ponto de entrada da aplicação
├── db/
│   ├── schema.prisma      # Definição do banco de dados
│   ├── client.js          # Instância do Prisma Client
│   ├── client/            # Cliente Prisma gerado
│   └── migrations/        # Histórico de alterações do banco
└── http/
    ├── routes/            # Definição das rotas
    │   ├── index.routes.js    # Agregador de todas as rotas
    │   ├── produtos.routes.js
    │   └── auth.routes.js
    ├── controllers/       # Lógica de requisição/resposta
    │   ├── produtos.routes.js
    │   └── auth.controller.js
    ├── services/          # Regras de negócio e acesso ao banco
    │   ├── produtos.services.js
    │   └── import-from-fakestore.js
    └── middleware/        # Funções intermediárias
        └── verify-jwt.js
```

### 🔄 Fluxo de uma Requisição

```
Cliente → Rota → Controller → Service → Prisma → MySQL
```

**Exemplo prático:** Listar produtos

1. **Rota** (`produtos.routes.js`): Define `GET /api/produtos`
2. **Controller** (`produtos.routes.js`): Extrai parâmetros da requisição
3. **Service** (`produtos.services.js`): Executa a query no banco via Prisma
4. **Resposta**: JSON com os produtos

### 📦 Explicação de Cada Camada

| Camada | Responsabilidade | Exemplo |
|--------|------------------|---------|
| **Routes** | Define os endpoints e métodos HTTP | `produtosRoutes.get('/', listarProdutos)` |
| **Controllers** | Recebe a requisição, valida dados e retorna resposta | Extrai `req.query`, chama service, retorna `res.json()` |
| **Services** | Contém a lógica de negócio e acesso ao banco | Monta filtros e executa `prismaClient.produto.findMany()` |
| **Middleware** | Intercepta requisições (autenticação, logs, etc.) | Verifica JWT antes de acessar rotas protegidas |

### 🔗 index.routes.js - O Agregador

O arquivo `index.routes.js` centraliza todas as rotas da aplicação:

```javascript
import authRoutes from "./auth.routes.js";
import produtosRoutes from "./produtos.routes.js";

const routes = Router();
routes.use("/auth", authRoutes);      // /api/auth/*
routes.use("/produtos", produtosRoutes); // /api/produtos/*

export default routes;
```

No `server.js`, todas as rotas ficam sob o prefixo `/api`:
```javascript
app.use("/api", routes);
```

---

## 🔷 Entendendo o Prisma

O **Prisma** é um ORM (Object-Relational Mapping) moderno que facilita a comunicação com o banco de dados usando JavaScript/TypeScript.

### Schema (`schema.prisma`)

O schema define a estrutura do banco de dados de forma declarativa:

```prisma
model Produto {
  id         Int      @id @default(autoincrement())
  titulo     String
  preco      Decimal  @db.Decimal(10, 2)
  categoria  String
  estoque    Int
  
  @@map("produtos")  // Nome da tabela no MySQL
}
```

### Prisma Client

O Prisma gera automaticamente um cliente tipado baseado no schema:

```javascript
// Uso no service
const produtos = await prismaClient.produto.findMany({
  where: { categoria: "electronics" }
});
```

### Onde fica o Prisma Client?

No projeto, o cliente está em `src/db/client.js`:

```javascript
import { PrismaClient } from "../db/client/client.ts";

export const prismaClient = new PrismaClient({
  adapter, // Adaptador MariaDB/MySQL
});
```

### Migrations (Migrações)

Migrações são o histórico de alterações do banco. Cada mudança no schema gera uma nova migration:

```bash
# Criar nova migration após alterar schema.prisma
npx prisma migrate dev --name nome_da_alteracao
```

As migrations ficam em `src/db/migrations/` e contêm SQL puro.

### ⚠️ Boas Práticas

- **Validações sempre no backend**: Nunca confie apenas no front-end
- **Consulte o banco para estoque**: Múltiplos usuários podem comprar simultaneamente
- **Use transações**: Para operações que envolvem múltiplas tabelas (ex: criar pedido)

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- Node.js instalado
- Docker instalado (para o MySQL)

### Passo a passo

**1. Clone o repositório e instale dependências:**
```bash
npm install
```

**2. Suba o banco MySQL com Docker:**
```bash
docker-compose up -d
```

**3. Configure o arquivo `.env`:**
```env
PORT=3333
ACCESS_TOKEN_SECRET=sua_chave_secreta
```

**4. Execute as migrations:**
```bash
npx prisma migrate dev
```

**5. Inicie o servidor:**
```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3333`

> 💡 Na inicialização, os produtos da FakeStore API são importados automaticamente!

---

## 📡 Endpoints da API

### Produtos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/produtos` | Lista todos os produtos |
| GET | `/api/produtos?categoria=electronics` | Filtra por categoria |
| GET | `/api/produtos?q=shirt` | Busca por título |
| GET | `/api/produtos/:id` | Detalhes de um produto |

**Exemplo de resposta - Listar produtos:**
```json
[
  {
    "id": 1,
    "titulo": "Fjallraven Backpack",
    "preco": "109.95",
    "categoria": "men's clothing",
    "imagemUrl": "https://...",
    "estoque": 100
  }
]
```

### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/register` | Cadastrar usuário |
| POST | `/api/auth/login` | Login (retorna JWT) |

---

## ✅ O que já está implementado

### Backend
- [x] Estrutura de pastas modularizada (routes/controllers/services)
- [x] Conexão com MySQL via Prisma 7.0
- [x] Schema do banco com todas as tabelas necessárias
- [x] Importação automática de produtos da FakeStore API
- [x] Endpoint para listar produtos com filtros (categoria e busca)
- [x] Endpoint para detalhar produto
- [x] Sistema de autenticação (registro e login com JWT)
- [x] Middleware de verificação JWT
- [x] Docker Compose para o MySQL

### Banco de Dados
- [x] Tabela `produtos` (id, titulo, preco, categoria, imagem_url, descricao, estoque)
- [x] Tabela `clientes` (id, nome, email)
- [x] Tabela `pedidos` (id, data, cliente_id, total)
- [x] Tabela `itens_pedido` (id, pedido_id, produto_id, quantidade, preco_unit)
- [x] Tabela `users` (para autenticação)
- [x] Relacionamentos configurados no Prisma

---

## 📋 TODO List - O que falta implementar

### 🔴 Alta Prioridade (Requisitos Obrigatórios)

#### Validação de Estoque
- [ ] Criar endpoint `POST /api/carrinho/validar` para validar estoque ao adicionar item
- [ ] Consultar estoque atual no banco (não confiar no front-end)
- [ ] Retornar erro se quantidade solicitada > estoque disponível

#### Criação de Pedidos
- [ ] Criar endpoint `POST /api/pedidos` para finalizar compra
- [ ] Receber dados do cliente (nome, email) e itens do carrinho
- [ ] Revalidar estoque de todos os itens antes de criar pedido
- [ ] Usar transação Prisma para garantir atomicidade:
  - Criar/buscar cliente
  - Criar registro em `pedidos`
  - Criar registros em `itens_pedido`
  - Atualizar estoque dos produtos (decrementar)
- [ ] Retornar erro se algum item não tiver estoque suficiente
- [ ] Retornar número do pedido em caso de sucesso

#### Listagem de Compras
- [ ] Criar endpoint `GET /api/pedidos?email=cliente@email.com`
- [ ] Retornar todos os pedidos do cliente com:
  - Data do pedido
  - Valor total
  - Lista de produtos (nome, quantidade, preço unitário)

### 🟡 Média Prioridade (Melhorias)

#### Tratamento de Erros
- [ ] Padronizar respostas de erro em todos os endpoints
- [ ] Adicionar validação de campos obrigatórios
- [ ] Retornar códigos HTTP adequados (400, 404, 409, 500)

#### Importação FakeStore
- [ ] Criar endpoint dedicado `POST /api/admin/importar-produtos`
- [ ] Remover importação automática do startup (opcional)

#### Middleware JWT
- [ ] Corrigir bug no `verify-jwt.js` (split incorreto)
- [ ] Aplicar middleware apenas em rotas que precisam de autenticação

### 🟢 Baixa Prioridade (Extras)

- [ ] Adicionar paginação na listagem de produtos
- [ ] Criar endpoint para listar categorias disponíveis
- [ ] Adicionar logs estruturados
- [ ] Documentar API com Swagger/OpenAPI

---

## 👥 Equipe

Projeto desenvolvido para a disciplina de Programação Web - UNIVALI

---

## 📄 Licença

Projeto acadêmico - Uso educacional
