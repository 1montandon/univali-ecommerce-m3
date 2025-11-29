**Projeto**

- **Nome:**: Picota Shop - Eduardo Montandon, Yan Battiston 
- **Descrição:**: Aplicação de exemplo para um e‑commerce contendo frontend estático (HTML/JS) e backend em Node.js com Prisma para acesso ao banco. O frontend fornece páginas de catálogo, produto, carrinho, checkout, login e registro; o backend expõe rotas HTTP para autenticação, produtos, pedidos e carrinho.

**Tecnologias**

- **Frontend:**: HTML, CSS, JavaScript (arquivos em `frontend/public` e `frontend/js`).
- **Backend:**: Node.js, Express, Prisma, JWT, bcrypt (código em `backend/src`).
- **Banco / ORM:**: Prisma (schema em `backend/src/db/schema.prisma`).
- **Outras:**: Docker / Docker Compose (arquivo `backend/docker-compose.yaml`).

**Estrutura do projeto**

- **Raiz do repositório:**: contém as pastas `backend/` e `frontend/`.
- **Backend:**: `backend/src/` — servidor, controllers, serviços e configuração do Prisma.
- **Frontend:**: `frontend/public/` — páginas estáticas; `frontend/js/` — scripts do cliente.

**Como rodar (local)**

- **Backend (modo desenvolvimento):**

  1. Abra um terminal e vá para a pasta do backend:

     `cd backend`

  2. Instale dependências:

     `npm install`

  3. Execute em modo de desenvolvimento:

     `npm run dev`

  O script disponível no `package.json` do backend é `dev` (executa `node --watch --experimental-strip-types src/server.js`).

- **Frontend (páginas estáticas):**

  - Simplesmente abra os arquivos HTML em `frontend/public` em um navegador (por exemplo, abra `frontend/public/index.html`).
  - Ou sirva a pasta com um servidor estático para evitar problemas de CORS/API: por exemplo, usando `npx serve` ou Python:

    `npx serve frontend/public`
    ou
    `cd frontend/public && python -m http.server 3000`

- **Rodar com Docker Compose (opcional):**

  - A partir da pasta `backend`, execute:

    `cd backend && docker compose up --build`

  Isso irá construir e iniciar os serviços definidos em `backend/docker-compose.yaml`.

**Variáveis de ambiente importantes**

- **DATABASE_URL:**: string de conexão do banco para o Prisma.
- **JWT_SECRET** (ou nome similar): chave secreta para geração/validação de tokens JWT.

Crie um arquivo `.env` na pasta `backend` com essas variáveis antes de iniciar o servidor, se necessário.

**Observações**

- O backend depende do Prisma; após configurar `DATABASE_URL` e o banco, é possível rodar migrações se houver scripts/arquivos de migração sob `backend/src/db/migrations`.
- Os endpoints e rotas estão em `backend/src/http/routes` e os controladores em `backend/src/http/controllers`.

**Contato / Próximos passos**

- Para testes locais rápidos, inicie o backend (`npm run dev`) e abra as páginas em `frontend/public`.
