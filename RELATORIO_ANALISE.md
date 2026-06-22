# 📊 Relatório de Análise do Projeto

## 1. 🏗️ Identificação e visão geral

- **Nome do projeto:** Intertrack / UNASP Correio Interno
- **Objetivo identificado:** gerenciar encomendas do internato/correio interno do UNASP, permitindo cadastro por funcionários e consulta por alunos.
- **Problema que o sistema pretende resolver:** controle de recebimento, disponibilidade, retirada e consulta de encomendas internas para alunos.
- **Funcionalidades do MVP descritas:**
  - login de aluno/funcionário;
  - cadastro e gerenciamento de encomendas;
  - consulta de encomendas por aluno;
  - dashboards e gráficos;
  - histórico/status de encomendas;
  - persistência local no frontend durante desenvolvimento;
  - preparação para API e banco de dados.
- **Tecnologias principais:**
  - Node.js
  - Express
  - Prisma ORM
  - MySQL/MariaDB
  - React
  - Vite
  - Tailwind CSS
  - React Router
- **Linguagens utilizadas:**
  - JavaScript no backend
  - TypeScript/TSX no frontend
  - SQL nas migrations

### Evidências consultadas

- `README.md` — contém apenas o título `intertrack.tcc`.
- `frontend/README.md` — descreve o sistema como gerenciamento de encomendas para o internato do UNASP.
- `backend/package.json` — identifica Express, Prisma, MariaDB adapter, bcrypt, JWT e CORS.
- `frontend/package.json` — identifica React, Vite, TypeScript, Tailwind e React Router.
- `backend/prisma/schema.prisma` — define models de usuários, funcionários, encomendas, status, remetentes, notificações, autorizações, auditoria e histórico.
- `frontend/src/app/routes.tsx` — define rotas de aluno e funcionário.

---

## 2. 📂 Organização do repositório

```text
.
├── README.md
├── RELATORIO_ANALISE.md
├── backend
│   ├── .env.example
│   ├── .gitignore
│   ├── fillCodigos.js
│   ├── package.json
│   ├── prisma.config.ts
│   ├── prisma
│   │   ├── schema.prisma
│   │   ├── seed.js
│   │   └── migrations
│   │       └── 20260616211620_init
│   │           └── migration.sql
│   └── src
│       ├── config
│       │   └── prisma.js
│       ├── controllers
│       ├── middlewares
│       ├── models
│       ├── routes
│       ├── services
│       └── server.js
└── frontend
    ├── README.md
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.ts
    ├── vite.config.ts
    ├── public
    │   ├── campus.png
    │   ├── logoazul.webp
    │   ├── logolaranja.png
    │   └── logounasp.png
    └── src
        ├── main.tsx
        ├── app
        │   ├── App.tsx
        │   ├── routes.tsx
        │   ├── components
        │   ├── context
        │   ├── data
        │   ├── lib
        │   └── pages
        └── styles
```

### Responsabilidade das pastas

- `backend` — aplicação Node.js/Express, Prisma, migrations e configuração de banco.
- `backend/src/routes` — definição de endpoints da API.
- `backend/src/controllers` — tratamento das requisições HTTP.
- `backend/src/services` — operações de negócio e acesso ao Prisma para encomendas e nomes alternativos.
- `backend/src/config` — configuração do Prisma Client.
- `backend/prisma` — schema, migrations e seed.
- `frontend` — aplicação React/Vite.
- `frontend/src/app/pages` — telas de aluno, funcionário e login.
- `frontend/src/app/components` — componentes de layout e UI.
- `frontend/src/app/context` — estado global da aplicação.
- `frontend/src/app/lib` — tipos, storage local e cliente HTTP.
- `frontend/src/styles` — CSS global e variáveis de tema.

### Análise da organização

- Separação entre frontend e backend: adequada.
- Nomes de pastas e arquivos: em geral claros, com organização por camadas no backend e por app/components/pages no frontend.
- Arquivos de configuração: existem `package.json` separados, `vite.config.ts`, `postcss.config.js`, `tailwind.config.ts`, `prisma.config.ts`, `.gitignore` e `.env.example`.
- Organização mínima do projeto: atende parcialmente bem. Há arquivos inconsistentes ou aparentemente obsoletos, como `backend/src/models/model.controller.js`, `backend/src/test.js` e `backend/prisma/seed.js`, que referenciam nomes inexistentes ou divergentes do schema atual.

---

## 3. 📘 README e documentação inicial

**Localização:** `README.md` e `frontend/README.md`

| Item esperado | Situação | Evidência |
|---|---|---|
| Nome do projeto | Parcial | `README.md` contém `intertrack.tcc`; `frontend/README.md` contém `UNASP Correio Interno` |
| Problema que o sistema resolve | Parcial | `frontend/README.md` descreve gerenciamento de encomendas para o internato |
| Objetivo do projeto | Parcial | `frontend/README.md` informa cadastro pelo funcionário e consulta pelo aluno |
| Funcionalidades do MVP | Atende parcialmente | `frontend/README.md` lista login, perfis, cadastro, gerenciamento, dashboard, filtros e notificações |
| Tecnologias utilizadas | Não atende | Não há lista objetiva de tecnologias no README raiz ou frontend |
| Instruções para execução local | Não atende | Não foram identificadas instruções de instalação/execução local |
| Divisão entre frontend, backend e banco | Não atende | Não há seção documentando arquitetura ou divisão entre camadas |

### Histórico de commits e participação

- Histórico disponível para análise: Sim.
- Participação dos integrantes identificável: Parcial.
- Evidências: `git log` local apresenta autores como `hfcosta`, `giucei`, `Jhony Samuel Freitas`, `sabriny_veloso`, `Laura Zaguette` e mensagens relacionadas a Prisma, rotas, Tailwind, design e logos. A análise local não comprova a divisão formal de tarefas nem a participação individual em todas as entregas.

> Não foi atribuída autoria individual de funcionalidades sem evidências completas no histórico.

### Professor como colaborador

**Situação:** NÃO VERIFICÁVEL PELO REPOSITÓRIO

---

## 4. ⚙️ Backend

- **Localização:** `backend`
- **Linguagem:** JavaScript
- **Framework principal:** Express
- **Arquivo de inicialização:** `backend/src/server.js`
- **Servidor configurado:** Sim

### Estrutura identificada

- `backend/src/server.js` — inicializa Express, JSON parser, CORS, rotas e conexão Prisma.
- `backend/src/config/prisma.js` — instancia Prisma Client com adapter MariaDB.
- `backend/src/routes/userRoutes.js` — rotas de registro e login.
- `backend/src/routes/encomendaRoutes.js` — rotas CRUD e atualização de status de encomendas.
- `backend/src/routes/nomeEntregaRoutes.js` — rotas para nomes alternativos autorizados.
- `backend/src/controllers/userController.js` — cadastro e login de usuário com bcrypt e JWT.
- `backend/src/controllers/encomendaController.js` — recebe requisições de encomendas e delega aos services.
- `backend/src/controllers/nomeEntregaController.js` — recebe requisições de nomes alternativos e delega ao service.
- `backend/src/services/encomendas.services.js` — usa Prisma para criar, listar, buscar, atualizar status e deletar encomendas.
- `backend/src/services/nomeEntrega.service.js` — usa Prisma para criar, listar e deletar nomes alternativos.
- `backend/src/middlewares/auth.js` — valida JWT enviado no header `Authorization`.

### Organização interna

- Rotas: existem para usuários, encomendas e nomes alternativos.
- Controllers: existem e são usados pelas rotas principais.
- Services: existem para encomendas e nomes alternativos.
- Middlewares: há middleware de autenticação por JWT.
- Configuração do banco: existe em `backend/src/config/prisma.js`.
- Validações: são limitadas; o backend depende principalmente de campos recebidos e erros do Prisma.
- Tratamento de erros: existe `try/catch` com respostas JSON, mas sem padronização central.

### Funcionalidades implementadas

- Cadastro de usuário — Evidência: `backend/src/controllers/userController.js`
- Login com senha criptografada e JWT — Evidência: `backend/src/controllers/userController.js`
- Listagem de encomendas com busca — Evidência: `backend/src/services/encomendas.services.js`
- Cadastro de encomenda com histórico inicial em transação — Evidência: `backend/src/services/encomendas.services.js`
- Busca de encomenda por ID com relacionamentos — Evidência: `backend/src/services/encomendas.services.js`
- Atualização de status com registro em histórico — Evidência: `backend/src/services/encomendas.services.js`
- Exclusão de encomenda — Evidência: `backend/src/services/encomendas.services.js`
- CRUD parcial de nomes alternativos — Evidência: `backend/src/routes/nomeEntregaRoutes.js` e `backend/src/services/nomeEntrega.service.js`

### Fluxo das requisições

```text
requisição → rota Express → controller → service ou Prisma direto → banco de dados → resposta JSON
```

Fluxos completos comprovados:

```text
POST /usuarios/register → userRoutes → userController.create → prisma.usuario.create → resposta JSON
POST /usuarios/login → userRoutes → userController.login → prisma.usuario.findUnique → bcrypt/JWT → resposta JSON
GET /encomendas → encomendaRoutes → encomendaController.list → listarEncomendas → prisma.encomenda.findMany → resposta JSON
POST /encomendas → encomendaRoutes → auth → encomendaController.create → criarEncomenda → prisma.$transaction → resposta JSON
PATCH /encomendas/:id/status → encomendaRoutes → auth → encomendaController.updateStatus → atualizarStatusEncomenda → prisma.$transaction → resposta JSON
```

Fluxos interrompidos ou inconsistentes:

- `backend/src/services/nomeEntrega.service.js` envia campos `nome` e `tipo`, mas o model `NomeAlternativo` define `nome_completo` e `parentesco`; isso indica incompatibilidade com o schema.
- `backend/src/models/model.controller.js` importa `../models/id.model.js`, mas o arquivo existente é `id.models.js`; também importa `prisma` como default, enquanto `config/prisma.js` exporta `prisma` nomeado.
- `backend/src/test.js` importa `./src/models/usuarioModels.js`, arquivo não identificado.
- `backend/prisma/seed.js` referencia `tiposUsuario`, model não definido em `schema.prisma`.

---

## 5. 🗄️ Banco de dados e Prisma ORM

- **Tipo de banco:** MySQL/MariaDB
- **ORM:** Prisma
- **Configuração principal:** `backend/prisma.config.ts` e `backend/src/config/prisma.js`
- **Schema Prisma:** `backend/prisma/schema.prisma`
- **Migrations:** Sim
- **Localização das migrations:** `backend/prisma/migrations`

### Models ou entidades identificadas

- `Usuario` — usuário aluno/destinatário; campos principais: `id`, `codigo`, `nome`, `email`, `senha`, `telefone`, `ativo`.
- `Funcionario` — funcionário responsável por operações; campos: `id`, `codigo`, `nome`, `email`, `senha`, `telefone`, `cargo`, `ativo`.
- `StatusEncomenda` — status possíveis das encomendas; campos: `id`, `codigo`, `nome_status`, `descricao`.
- `Remetente` — origem/remetente da encomenda; campos: `id`, `codigo`, `nome`, `tipo`, `site`.
- `NomeAlternativo` — nomes autorizados/alternativos ligados a usuário; campos: `id`, `usuario_id`, `nome_completo`, `documento`, `parentesco`, `ativo`.
- `Encomenda` — entidade central de encomendas; campos: `codigo_rastreio`, `descricao`, `destinatario_usuario_id`, `remetente_id`, `funcionario_id`, `status_atual_id`, `data_entrega`, `observacoes`.
- `HistoricoStatus` — histórico de alteração de status; relaciona encomenda, status e funcionário.
- `Notificacao` — notificações para usuário sobre encomendas.
- `Autorizacao` — autorização de retirada por destinatário alternativo ou nome avulso.
- `Auditoria` — registro de ações de funcionários.

### Modelagem

| Elemento | Situação | Evidência |
|---|---|---|
| Models principais definidos | Atende | `backend/prisma/schema.prisma` |
| Chaves primárias | Atende | Todos os models principais usam `id String @id @db.Char(36)` |
| Chaves estrangeiras e relações | Atende | Relações entre `Encomenda`, `Usuario`, `Funcionario`, `StatusEncomenda`, `Remetente`, `HistoricoStatus`, `Notificacao`, `Autorizacao` |
| Campos coerentes com o domínio | Atende | Models cobrem usuários, funcionários, encomendas, status, histórico, notificações e autorizações |
| Prisma Client utilizado no backend | Atende | `backend/src/config/prisma.js`, controllers e services |
| Operação real de banco em rota/controller | Atende | `userController.js`, `encomendas.services.js`, `nomeEntrega.service.js` |

### Operações Prisma encontradas

- `findMany`, `findUnique` ou equivalente: `backend/src/services/encomendas.services.js`, `backend/src/services/nomeEntrega.service.js`, `backend/src/controllers/userController.js`, `backend/fillCodigos.js`
- `create`: `backend/src/controllers/userController.js`, `backend/src/services/encomendas.services.js`, `backend/src/services/nomeEntrega.service.js`
- `update`: `backend/src/services/encomendas.services.js`, `backend/fillCodigos.js`
- `delete`: `backend/src/services/encomendas.services.js`, `backend/src/services/nomeEntrega.service.js`
- Outras operações: `prisma.$transaction` em `backend/src/services/encomendas.services.js`; `prisma.$connect` e `$disconnect` em `backend/src/server.js`

### Banco no servidor de produção

A existência de `backend/.env.example`, `backend/prisma.config.ts`, `backend/src/config/prisma.js` e migrations indica preparação para conexão e criação de banco. O repositório não comprova que o banco foi criado em servidor de produção.

**Situação:** NÃO VERIFICÁVEL PELO REPOSITÓRIO

Não foi exposto conteúdo de variáveis sensíveis.

---

## 6. 🌐 Rotas da API e arquivo do Insomnia

### Rotas encontradas no backend

| Método | Endpoint | Arquivo | Operação realizada | Usa Prisma |
|---|---|---|---|---|
| GET | `/` | `backend/src/server.js` | Retorna mensagem de API online | Não |
| POST | `/usuarios/register` | `backend/src/routes/userRoutes.js` | Cadastra usuário | Sim |
| POST | `/usuarios/login` | `backend/src/routes/userRoutes.js` | Autentica usuário e retorna token | Sim |
| POST | `/encomendas` | `backend/src/routes/encomendaRoutes.js` | Cria encomenda e histórico | Sim |
| GET | `/encomendas` | `backend/src/routes/encomendaRoutes.js` | Lista encomendas com busca opcional | Sim |
| GET | `/encomendas/:id` | `backend/src/routes/encomendaRoutes.js` | Busca encomenda por ID | Sim |
| PATCH | `/encomendas/:id/status` | `backend/src/routes/encomendaRoutes.js` | Atualiza status e cria histórico | Sim |
| DELETE | `/encomendas/:id` | `backend/src/routes/encomendaRoutes.js` | Remove encomenda | Sim |
| POST | `/nomes-entrega` | `backend/src/routes/nomeEntregaRoutes.js` | Cria nome alternativo | Sim |
| GET | `/nomes-entrega` | `backend/src/routes/nomeEntregaRoutes.js` | Lista nomes alternativos do usuário autenticado | Sim |
| DELETE | `/nomes-entrega/:id` | `backend/src/routes/nomeEntregaRoutes.js` | Remove nome alternativo | Sim |

### Adequação das rotas

- Uso dos métodos HTTP: adequado para cadastro, listagem, busca, atualização parcial e exclusão.
- Organização por funcionalidade: adequada, separada por usuários, encomendas e nomes de entrega.
- Clareza dos nomes: adequada.
- Existência de parâmetros: há `:id` em busca, atualização e exclusão.
- Recebimento de JSON: configurado por `express.json()` em `backend/src/server.js`.
- Respostas em JSON: identificadas em controllers e rota raiz.
- Relação com o MVP: as rotas cobrem autenticação inicial, encomendas e nomes autorizados. Ainda há lacunas em compatibilidade de payloads e em alguns scripts/arquivos auxiliares.

### Arquivo exportado do Insomnia

- **Arquivo encontrado:** NÃO IDENTIFICADO
- **Formato:** NÃO IDENTIFICADO
- **Rotas organizadas por funcionalidade:** Não
- **Nomes claros nas requisições:** Não
- **Exemplos de corpo JSON:** Não
- **Parâmetros e variáveis configurados:** Não
- **Compatibilidade com as rotas do backend:** Não

Não foi encontrado arquivo exportado do Insomnia na árvore rastreada ou listada do projeto. O histórico de commits menciona “Rotas Insomnia”, mas isso não comprova a presença do entregável no repositório atual.

---

## 7. 🎨 Frontend

- **Localização:** `frontend`
- **Framework:** React
- **Linguagem:** TypeScript/TSX
- **Ferramenta de criação/build:** Vite
- **Tailwind CSS:** Configurado/Parcial
- **Roteamento:** React Router

### Arquivos principais

- `frontend/src/main.tsx` — ponto de entrada React.
- `frontend/src/app/App.tsx` — registra provider global, toaster e router.
- `frontend/src/app/routes.tsx` — define rotas de login, aluno e funcionário.
- `frontend/src/app/context/AppContext.tsx` — estado global de usuário, encomendas, tema, login, cadastro e fallback local.
- `frontend/src/app/lib/api.ts` — cliente HTTP com `fetch` para `/api`.
- `frontend/src/app/data/mockData.ts` — usuários e encomendas mockados.
- `frontend/src/styles/globals.css` — importa Tailwind e tema.
- `frontend/vite.config.ts` — configura proxy `/api` para `http://localhost:3000`.

### Páginas e componentes

- `frontend/src/app/pages/LoginPage.tsx` — login e cadastro.
- `frontend/src/app/pages/student/StudentDashboard.tsx` — resumo das encomendas do aluno.
- `frontend/src/app/pages/student/StudentConsultar.tsx` — consulta e filtros de encomendas do aluno.
- `frontend/src/app/pages/student/StudentHistorico.tsx` — histórico do aluno.
- `frontend/src/app/pages/student/StudentPerfil.tsx` — perfil local do aluno.
- `frontend/src/app/pages/staff/StaffDashboard.tsx` — painel de funcionário com métricas e ações locais.
- `frontend/src/app/pages/staff/StaffCadastrar.tsx` — formulário local de cadastro de encomenda.
- `frontend/src/app/pages/staff/StaffGerenciar.tsx` — filtro/listagem de encomendas.
- `frontend/src/app/pages/staff/StaffGraficos.tsx` — gráficos com dados de encomendas.
- `frontend/src/app/pages/staff/StaffPerfis.tsx` — tela de perfis e permissões, mas não está registrada em `routes.tsx`.
- `frontend/src/app/components/ProtectedRoute.tsx` — proteção por tipo de usuário armazenado no contexto.
- `frontend/src/app/components/StaffLayout.tsx` e `StudentLayout.tsx` — layouts por perfil.

### Análise do desenvolvimento inicial

| Elemento | Situação | Evidência |
|---|---|---|
| Projeto React iniciado | Atende | `frontend/src/main.tsx`, `frontend/src/app/App.tsx` |
| Uso de JavaScript | Parcial | Backend em JavaScript; frontend usa TypeScript/TSX, divergente da orientação, sem gerar bônus |
| Tailwind configurado ou utilizado | Parcial | `frontend/src/styles/globals.css`, `frontend/postcss.config.js`, `frontend/tailwind.config.ts` |
| Telas principais iniciadas | Atende | `frontend/src/app/pages` |
| Componentes organizados | Atende | `frontend/src/app/components` |
| Navegação entre páginas | Atende | `frontend/src/app/routes.tsx` |
| Tela conectada ou preparada para API | Parcial | `frontend/src/app/lib/api.ts` e `frontend/src/app/context/AppContext.tsx` |

Observação: `frontend/tailwind.config.ts` importa `tailwindcss-animate`, mas essa dependência não aparece em `frontend/package.json`, o que indica possível inconsistência de configuração.

---

## 8. 🔗 Conexão entre frontend e backend

- **Tipo de comunicação:** REST
- **Cliente HTTP:** Fetch
- **Arquivo de configuração da API:** `frontend/src/app/lib/api.ts`
- **URL base:** `/api`, definida em `frontend/src/app/lib/api.ts`
- **Variáveis de ambiente:** `backend/.env.example`; não foi identificado `.env.example` no frontend
- **CORS no backend:** Configurado em `backend/src/server.js`
- **Proxy no frontend:** Configurado em `frontend/vite.config.ts`

### Endpoints consumidos pelo frontend

| Endpoint | Método | Componente ou página | Finalidade | Compatível com o backend |
|---|---|---|---|---|
| `/api/encomendas` | GET | `frontend/src/app/context/AppContext.tsx` via `fetchPackagesFromApi` | Carregar encomendas inicialmente | Parcial |
| `/api/usuarios/login` | POST | `frontend/src/app/context/AppContext.tsx` via `apiLogin` | Login | Sim |
| `/api/usuarios/register` | POST | `frontend/src/app/context/AppContext.tsx` via `apiRegister` | Cadastro de usuário | Sim |
| `/api/encomendas` | POST | `frontend/src/app/lib/api.ts` | Criar encomenda | Parcial; função não foi identificada em uso nas telas |
| `/api/encomendas/:id/status` | PATCH | `frontend/src/app/lib/api.ts` | Atualizar status | Parcial; envia `{ status }`, enquanto backend espera `status_atual_id` |
| `/api/encomendas/:id` | DELETE | `frontend/src/app/lib/api.ts` | Excluir encomenda | Parcial; função não foi identificada em uso nas telas |

### Fluxos comprovados

- Login tenta autenticação no backend por `apiLogin`; em falha, usa mock local.
- Cadastro tenta enviar ao backend por `apiRegister`; em falha, usa cadastro local.
- Carregamento inicial tenta buscar encomendas do backend por `fetchPackagesFromApi`; em falha ou lista vazia, usa `localStorage`/mock.

### Estado da integração

**Classificação:** Parcial.

Há comunicação identificável e coerente para login, cadastro e tentativa de listagem. Porém, as telas principais de cadastro/edição/exclusão de encomendas usam o estado local do contexto (`addPackage`, `updatePackage`, `deletePackage`) e não as funções HTTP equivalentes. Além disso, há divergência no payload de atualização de status (`status` no frontend contra `status_atual_id` no backend) e diferença entre o formato de encomenda usado no frontend (`codigo`, `aluno`, `ra`, `dataChegada`) e o schema/backend (`codigo_rastreio`, `destinatario_usuario_id`, `funcionario_id`, `status_atual_id`).

---

## 9. ✅ O que já está implementado

### Backend

- Servidor Express com JSON, CORS e rotas registradas.
- Registro e login de usuário com bcrypt e JWT.
- Rotas protegidas por middleware JWT para encomendas e nomes alternativos.
- CRUD principal de encomendas com Prisma.
- Histórico de status criado em transações Prisma.

### Banco de dados

- Schema Prisma com entidades centrais do domínio.
- Migration SQL inicial criada.
- Relações e chaves estrangeiras entre usuários, funcionários, encomendas, status, histórico, notificações, autorizações e auditoria.
- Configuração do Prisma Client com adapter MariaDB.

### Frontend

- Aplicação React/Vite iniciada.
- Rotas de login, aluno e funcionário.
- Layouts separados para aluno e funcionário.
- Telas de consulta, dashboard, histórico, perfil, cadastro, gerenciamento e gráficos.
- Tailwind/CSS global e tema claro/escuro.
- Estado local com mocks e persistência em `localStorage`.

### Integração

- Proxy `/api` configurado no Vite para backend local.
- Login e cadastro preparados para chamar backend.
- Listagem inicial de encomendas tenta consumir backend antes de usar fallback local.

---

## 10. 🚧 O que está incompleto ou em desenvolvimento

- README raiz incompleto.
  - **Evidência:** `README.md`
  - **Estado observado:** contém apenas o título do repositório.

- Arquivo exportado do Insomnia não encontrado.
  - **Evidência:** listagem de arquivos do repositório
  - **Estado observado:** não há arquivo Insomnia JSON/YAML identificado.

- Integração de encomendas no frontend ainda parcial.
  - **Evidência:** `frontend/src/app/context/AppContext.tsx`, `frontend/src/app/lib/api.ts`, `frontend/src/app/pages/staff/StaffCadastrar.tsx`, `frontend/src/app/pages/staff/StaffDashboard.tsx`
  - **Estado observado:** funções HTTP de criação/atualização/exclusão existem, mas telas manipulam estado local; payloads não estão totalmente alinhados ao backend.

- Service de nomes alternativos incompatível com schema.
  - **Evidência:** `backend/src/services/nomeEntrega.service.js` e `backend/prisma/schema.prisma`
  - **Estado observado:** service usa `nome` e `tipo`; schema exige `nome_completo` e define `parentesco`.

- Seed inconsistente com schema atual.
  - **Evidência:** `backend/prisma/seed.js`
  - **Estado observado:** referencia `tiposUsuario`, model não identificado em `schema.prisma`.

- Arquivos auxiliares quebrados ou obsoletos.
  - **Evidência:** `backend/src/models/model.controller.js`, `backend/src/test.js`
  - **Estado observado:** imports apontam para arquivos/exportações não encontrados ou divergentes.

- Tela de perfis não roteada.
  - **Evidência:** `frontend/src/app/pages/staff/StaffPerfis.tsx` e `frontend/src/app/routes.tsx`
  - **Estado observado:** componente existe, mas não foi identificado em rotas.

- Banco de produção não comprovado.
  - **Evidência:** `backend/.env.example`, `backend/prisma.config.ts`
  - **Estado observado:** há preparação de configuração, mas criação/uso em servidor não é verificável pelo repositório.

---

## 11. 📦 Dependências principais

### Backend

| Dependência | Versão | Finalidade identificada |
|---|---:|---|
| `express` | `^5.2.1` | Servidor HTTP e rotas |
| `cors` | `^2.8.6` | Habilitar CORS |
| `dotenv` | `^17.4.2` | Carregar variáveis de ambiente |
| `@prisma/client` | `^7.8.0` | Cliente Prisma |
| `@prisma/adapter-mariadb` | `^7.8.0` | Adapter MariaDB para Prisma |
| `bcrypt` | `^6.0.0` | Hash e comparação de senhas |
| `jsonwebtoken` | `^9.0.3` | Geração e validação de JWT |
| `uuid` | `^14.0.0` | Geração de IDs |
| `uuidv7` | `^1.2.1` | Geração alternativa de IDs |
| `nodemon` | `^3.1.14` | Desenvolvimento local |
| `prisma` | `^7.8.0` | CLI/configuração do Prisma |

### Frontend

| Dependência | Versão | Finalidade identificada |
|---|---:|---|
| `react` | `^18.3.1` | UI |
| `react-dom` | `^18.3.1` | Renderização React |
| `react-router-dom` | `^7.13.1` | Roteamento |
| `lucide-react` | `^0.487.0` | Ícones |
| `sonner` | `^1.7.4` | Toast notifications |
| `chart.js` | `^4.5.1` | Gráficos |
| `react-chartjs-2` | `^5.3.1` | Integração React com Chart.js |
| `vite` | `^5.4.11` | Build/dev server |
| `typescript` | `^5.6.3` | Tipagem e build TS |
| `tailwindcss` | `^4.0.9` | CSS utilitário |
| `@tailwindcss/postcss` | `^4.1.18` | Plugin PostCSS do Tailwind |
| `autoprefixer` | `^10.4.20` | Prefixos CSS |
| `@vitejs/plugin-react` | `^4.3.4` | Plugin React para Vite |

---

## 12. 🧭 Arquitetura e padrões identificados

- **Arquitetura predominante:** camadas simples no backend; SPA React com contexto global no frontend.
- **Separação de responsabilidades:** backend separa server, rotas, controllers, services, middleware e configuração Prisma. Frontend separa páginas, componentes, contexto, libs e estilos.
- **Padrões identificados:** REST API, controllers/services, middleware de autenticação, Prisma ORM, React Context, rotas protegidas, fallback local/mock.
- **Consistência entre os módulos:** parcial. A estrutura geral é coerente, mas há divergências entre modelos do Prisma e services, entre tipos do frontend e payloads do backend, e arquivos auxiliares com imports quebrados.

---

# 13. 📝 Avaliação conforme os critérios da AV2

## Quadro avaliativo

| Critério | Valor máximo | Nota atribuída | Evidências e justificativa |
|---|---:|---:|---|
| Organização do repositório, README e professor como colaborador | 1,5 | 0,9 | Boa separação `backend`/`frontend` e estrutura mínima adequada; README raiz quase vazio; documentação útil apenas em `frontend/README.md`; professor colaborador é NÃO VERIFICÁVEL PELO REPOSITÓRIO |
| Banco de dados criado e coerente com o MVP | 2,0 | 1,6 | Schema Prisma e migration cobrem bem o domínio de encomendas; há relações e chaves; criação em produção não é verificável; `seed.js` está inconsistente com schema atual |
| Arquivo exportado do Insomnia com as rotas organizadas | 1,5 | 0,0 | Arquivo exportado do Insomnia NÃO IDENTIFICADO no repositório |
| Backend iniciado com integração ao banco usando Prisma ORM | 2,0 | 1,5 | Express, Prisma, rotas e operações reais existem; há autenticação e CRUD de encomendas; há inconsistências em nomes alternativos e arquivos auxiliares quebrados |
| Frontend iniciado em React, JavaScript e Tailwind | 1,5 | 1,2 | React/Vite iniciado, várias telas e Tailwind/CSS presentes; frontend usa TypeScript/TSX; há possível dependência ausente em `tailwind.config.ts` |
| Conexão inicial entre frontend e backend | 1,0 | 0,6 | Há proxy Vite e chamadas `fetch` para login, cadastro e listagem; criação/edição/exclusão de encomendas nas telas ainda usam estado local e há divergências de payload |
| Clareza na apresentação e divisão de tarefas do grupo | 0,5 | NÃO VERIFICÁVEL | Histórico local mostra múltiplos autores, mas a clareza da apresentação e divisão formal de tarefas depende de verificação externa |
| **Total verificável no repositório** | **10,0** | **5,8 + item externo a definir** | Soma dos itens com nota numérica verificável: 5,8; critério de apresentação/divisão permanece a definir |

### Observação sobre o total

- **Pontuação obtida nos itens verificáveis:** 5,8
- **Pontos dependentes de apresentação ou verificação externa:** 0,5, além da confirmação de professor como colaborador dentro do primeiro critério
- **Nota máxima que pode ser confirmada apenas pelo repositório:** 9,5, considerando que apresentação/divisão de tarefas não é verificável localmente

Itens não verificáveis não foram automaticamente transformados em zero quando dependem de apresentação ou acesso externo. O arquivo do Insomnia recebeu zero porque o entregável esperado não foi identificado no repositório.

---

## 14. 📌 Síntese por critério

### 14.1 Organização do repositório e README — máximo 1,5

- **Situação:** Parcial
- **Evidências:** `backend`, `frontend`, `README.md`, `frontend/README.md`, `package.json` de cada camada
- **Aspectos comprovados:** separação frontend/backend, estrutura backend por rotas/controllers/services, frontend organizado por páginas/componentes/contexto.
- **Aspectos ausentes:** README raiz completo, instruções locais, documentação clara de tecnologias e arquitetura.
- **Aspectos não verificáveis:** professor como colaborador.
- **Nota sugerida:** 0,9/1,5

### 14.2 Banco de dados e coerência com o MVP — máximo 2,0

- **Situação:** Atende parcialmente
- **Evidências:** `backend/prisma/schema.prisma`, `backend/prisma/migrations/20260616211620_init/migration.sql`, `backend/prisma.config.ts`
- **Models/tabelas principais:** usuários, funcionários, encomendas, status, remetentes, histórico, notificações, autorizações, auditoria.
- **Coerência com o MVP:** boa aderência ao domínio de encomendas internas, cadastro, status e consulta.
- **Criação no servidor de produção:** Não verificável
- **Nota sugerida:** 1,6/2,0

### 14.3 Insomnia e organização das rotas — máximo 1,5

- **Situação:** Não atende
- **Evidências:** arquivo exportado não identificado na listagem do repositório
- **Organização das requisições:** NÃO IDENTIFICADO
- **Compatibilidade com o backend:** NÃO IDENTIFICADO
- **Nota sugerida:** 0,0/1,5

### 14.4 Backend com Prisma ORM — máximo 2,0

- **Situação:** Parcial
- **Evidências:** `backend/src/server.js`, `backend/src/config/prisma.js`, `backend/src/routes`, `backend/src/controllers`, `backend/src/services`
- **Servidor Node.js/Express:** configurado e registra rotas.
- **Prisma configurado:** configurado com adapter MariaDB e schema/migrations.
- **Operação no banco:** comprovada em usuários, encomendas e nomes alternativos.
- **Resposta em JSON:** comprovada nos controllers e rota raiz.
- **Nota sugerida:** 1,5/2,0

### 14.5 Frontend com React, JavaScript e Tailwind — máximo 1,5

- **Situação:** Parcial
- **Evidências:** `frontend/src/main.tsx`, `frontend/src/app/routes.tsx`, `frontend/src/styles/globals.css`, `frontend/postcss.config.js`
- **React iniciado:** sim.
- **JavaScript:** frontend está em TypeScript/TSX; backend em JavaScript.
- **Tailwind:** importado e configurado parcialmente.
- **Telas e componentes:** há telas principais de aluno e funcionário.
- **Nota sugerida:** 1,2/1,5

### 14.6 Conexão frontend-backend — máximo 1,0

- **Situação:** Parcial
- **Evidências:** `frontend/src/app/lib/api.ts`, `frontend/vite.config.ts`, `frontend/src/app/context/AppContext.tsx`, `backend/src/server.js`
- **Fluxo identificado:** login, cadastro e tentativa de listagem usam API; fallback local permanece predominante.
- **Compatibilidade das rotas e dados:** parcial; rotas existem, mas payloads de encomenda/status não estão plenamente alinhados.
- **Nota sugerida:** 0,6/1,0

### 14.7 Apresentação e divisão de tarefas — máximo 0,5

- **Situação:** Parcialmente comprovável apenas pelo histórico; avaliação final não verificável localmente
- **Evidências no repositório:** `git log` mostra múltiplos autores e commits em temas diferentes
- **O que precisa ser verificado na apresentação:** participação efetiva dos integrantes, divisão de tarefas, domínio técnico do que foi implementado
- **Nota sugerida:** A DEFINIR/0,5

---

## 15. 🔍 Pontos para verificação durante a apresentação

- Verificar se o arquivo exportado do Insomnia existe fora do repositório e se contém as rotas atuais.
- Demonstrar `POST /usuarios/register` e `POST /usuarios/login` com resposta JSON e token.
- Demonstrar uma rota protegida de encomendas usando header `Authorization`.
- Validar se `POST /encomendas` funciona com IDs reais de usuário, funcionário e status existentes no banco.
- Verificar se `PATCH /encomendas/:id/status` recebe o campo esperado pelo backend.
- Verificar se as telas de funcionário gravam no banco ou apenas no estado local.
- Demonstrar a integração real entre frontend e backend pelo proxy `/api`.
- Confirmar se o banco foi criado em servidor de produção ou apenas configurado localmente.
- Explicar a divergência entre `NomeAlternativo` no schema e o service de nomes de entrega.
- Confirmar a participação dos integrantes e a divisão das tarefas.
- Verificar se o professor está como colaborador no GitHub.

---

## 16. 📋 Conclusão

O projeto apresenta uma estrutura inicial relevante para a AV2, com separação clara entre backend e frontend, backend Express iniciado, Prisma configurado, schema de banco bem relacionado ao domínio de encomendas e frontend React com múltiplas telas já desenvolvidas.

As partes comprovadamente mais sólidas são o schema/migration do banco, as rotas e services de encomendas no backend, o login/cadastro com Prisma e o frontend com navegação por perfis. A integração frontend-backend existe, mas ainda é parcial: login, cadastro e listagem tentam usar API, enquanto o fluxo principal de gerenciamento de encomendas permanece muito apoiado em mocks/localStorage e não está totalmente compatível com os payloads do backend.

Os principais entregáveis não encontrados ou incompletos são o arquivo exportado do Insomnia, o README raiz completo, a comprovação de banco em produção e a comprovação de professor como colaborador. Também há inconsistências técnicas em `seed.js`, `nomeEntrega.service.js` e arquivos auxiliares do backend.

Com base apenas nas evidências disponíveis no repositório, a nota verificável sugerida é **5,8/10,0**, com **0,5 ponto de apresentação/divisão de tarefas a definir** e confirmação externa necessária para professor colaborador e banco de produção.
