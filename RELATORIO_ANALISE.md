# 📊 Relatório de Análise do Projeto

## 1. 🏗️ Visão Geral

- **Nome do projeto:** Intertrack / UNASP Correio Interno
- **Tecnologias principais identificadas:** Node.js, Express, React, TypeScript, Prisma ORM, MySQL/MariaDB
- **Linguagens utilizadas:** JavaScript (ES Modules), TypeScript, SQL

## 2. 📂 Estrutura de Pastas

```
intertrack.tcc/
├── backend/                    # API REST do servidor
│   ├── src/                   # Código-fonte do backend
│   │   ├── config/           # Configurações (Prisma)
│   │   ├── controllers/      # Controladores de rotas
│   │   ├── middlewares/      # Middlewares (autenticação JWT)
│   │   ├── models/           # Modelos (não implementados)
│   │   ├── routes/           # Definição de rotas da API
│   │   └── services/         # Lógica de negócio
│   ├── prisma/               # Schema e migrations do banco
│   │   ├── schema.prisma     # Modelo de dados
│   │   ├── migrations/       # Histórico de migrations
│   │   └── seed.js           # Script de seed
│   ├── generated/            # Cliente Prisma gerado
│   └── package.json          # Dependências do backend
│
└── frontend/                  # Interface do usuário
    ├── src/                  # Código-fonte do frontend
    │   ├── app/             # Aplicação principal
    │   │   ├── components/  # Componentes React reutilizáveis
    │   │   ├── context/     # Context API (estado global)
    │   │   ├── data/        # Dados mockados para desenvolvimento
    │   │   ├── lib/         # Utilitários e tipos TypeScript
    │   │   └── pages/       # Páginas da aplicação
    │   │       ├── staff/   # Páginas do funcionário
    │   │       └── student/ # Páginas do aluno
    │   └── styles/          # Estilos globais CSS
    ├── public/              # Arquivos estáticos
    └── package.json         # Dependências do frontend
```

**Descrição da responsabilidade de cada pasta:**

- **backend/src/config:** Configuração de conexão com banco de dados via Prisma
- **backend/src/controllers:** Controladores que recebem requisições HTTP e delegam para services
- **backend/src/middlewares:** Middleware de autenticação JWT para rotas protegidas
- **backend/src/services:** Camada de lógica de negócio e acesso a dados
- **backend/src/routes:** Definição de endpoints da API REST
- **backend/prisma:** Schema do banco de dados e migrations SQL
- **frontend/src/app/components:** Componentes UI reutilizáveis (layouts, badges, cards, etc.)
- **frontend/src/app/context:** Gerenciamento de estado global com Context API
- **frontend/src/app/pages:** Páginas da aplicação separadas por perfil (aluno/funcionário)
- **frontend/src/styles:** Estilos globais CSS e temas

## 3. ⚙️ Backend

**Localização:** `backend/`

**Tecnologia(s):** Node.js + Express.js (ES Modules)

**Arquivos principais:**

- **backend/src/server.js** - Ponto de entrada da aplicação, configuração do servidor Express, middlewares CORS e JSON, inicialização da conexão com banco de dados
- **backend/src/config/prisma.js** - Configuração do Prisma Client com adapter MariaDB
- **backend/src/middlewares/auth.js** - Middleware de verificação de token JWT
- **backend/src/controllers/userController.js** - Controlador de registro e login de usuários
- **backend/src/controllers/encomendaController.js** - Controlador CRUD de encomendas
- **backend/src/controllers/nomeEntregaController.js** - Controlador de nomes alternativos para entrega
- **backend/src/services/encomendas.services.js** - Lógica de negócio para encomendas (criar, listar, atualizar status, deletar)
- **backend/src/services/nomeEntrega.service.js** - Lógica de negócio para nomes alternativos
- **backend/src/routes/userRoutes.js** - Rotas de autenticação (/register, /login)
- **backend/src/routes/encomendaRoutes.js** - Rotas de encomendas (CRUD completo)
- **backend/src/routes/nomeEntregaRoutes.js** - Rotas de nomes alternativos
- **backend/fillCodigos.js** - Script utilitário para preencher códigos UUID em registros existentes

**Funcionalidades implementadas:**

- Sistema de autenticação com registro e login de usuários
- Criptografia de senhas com bcrypt
- Geração e validação de tokens JWT
- CRUD completo de encomendas
- Sistema de histórico de status de encomendas
- Gerenciamento de nomes alternativos para entrega
- Transações de banco de dados para garantir consistência
- Busca de encomendas por código de rastreio ou nome do destinatário
- Atualização de status com registro automático no histórico
- Middleware de autenticação para rotas protegidas
- Graceful shutdown do servidor e conexão com banco

## 4. 🗄️ Banco de Dados

**Tipo:** SQL (MySQL/MariaDB)

**Localização da configuração:** `backend/src/config/prisma.js` e `backend/prisma/schema.prisma`

**Models/Entidades identificadas:**

- **Usuario** - Usuários/alunos do sistema (id, codigo, nome, email, senha, telefone, ativo, timestamps)
- **Funcionario** - Funcionários do sistema (id, codigo, nome, email, senha, telefone, cargo [recebimento/administrador/porteiro/supervisor], ativo, timestamps)
- **StatusEncomenda** - Status possíveis de uma encomenda (id, codigo, nome_status, descricao)
- **Remetente** - Remetentes das encomendas (id, codigo, nome, tipo [correios/transportadora/ecommerce/outro], site, created_at)
- **NomeAlternativo** - Nomes alternativos para retirada de encomendas (id, codigo, usuario_id, nome_completo, documento, parentesco [pai/mae/irmao/irma/responsavel/outro], ativo, timestamps)
- **Encomenda** - Encomendas registradas (id, codigo, codigo_rastreio, descricao, destinatario_usuario_id, remetente_id, funcionario_id, status_atual_id, data_entrega, observacoes, timestamps)
- **HistoricoStatus** - Histórico de mudanças de status (id, codigo, encomenda_id, status_id, alterado_por, data_alteracao)
- **Notificacao** - Notificações para usuários (id, codigo, usuario_id, encomenda_id, tipo, mensagem, lida, created_at)
- **Autorizacao** - Autorizações de retirada (id, codigo, encomenda_id, destinatario_id, nome_avulso, documento, autorizado_por, validade, utilizada, created_at)
- **Auditoria** - Registro de auditoria de ações (id, codigo, funcionario_id, entidade, entidade_id, acao, descricao, ip_usuario, created_at)

**Migrations:** Sim - `backend/prisma/migrations/20260616211620_init/migration.sql`

**Observações:**

- Utiliza Prisma ORM como camada de abstração
- Adapter MariaDB configurado para compatibilidade
- Todas as tabelas usam UUID (CHAR(36)) como ID primário
- Sistema de códigos únicos (cuid) para identificação alternativa
- Relacionamentos bem definidos com chaves estrangeiras
- Cascata configurada para deleções em relacionamentos críticos
- Índices criados para otimização de buscas (codigo_rastreio, destinatario_usuario_id, etc.)
- Enums para padronização (CargoFuncionario, TipoRemetente, Parentesco)
- Timestamps automáticos (created_at, updated_at)

## 5. 🎨 Frontend

**Localização:** `frontend/`

**Tecnologia(s):** React 18 + TypeScript + Vite + TailwindCSS 4

**Arquivos principais:**

- **frontend/src/main.tsx** - Ponto de entrada da aplicação React
- **frontend/src/app/App.tsx** - Componente raiz com provedor de contexto e router
- **frontend/src/app/routes.tsx** - Configuração de rotas com React Router v7
- **frontend/src/app/context/AppContext.tsx** - Context API para estado global (usuário, pacotes, tema, autenticação)
- **frontend/src/app/data/mockData.ts** - Dados mockados para desenvolvimento (usuários e encomendas)
- **frontend/src/app/lib/storage.ts** - Funções de persistência no localStorage
- **frontend/src/app/lib/types.ts** - Definições de tipos TypeScript
- **frontend/src/app/lib/utils.ts** - Funções utilitárias
- **frontend/vite.config.ts** - Configuração do bundler Vite
- **frontend/tailwind.config.ts** - Configuração do TailwindCSS
- **frontend/src/styles/globals.css** - Estilos globais e variáveis CSS
- **frontend/src/styles/theme.css** - Sistema de temas (light/dark)

**Páginas/Componentes identificados:**

**Páginas:**

- **LoginPage** - Tela de login e cadastro com sistema de autenticação
- **StudentDashboard** - Dashboard do aluno com visão geral de encomendas
- **StudentConsultar** - Consulta e filtro de encomendas do aluno
- **StudentHistorico** - Histórico completo de encomendas do aluno
- **StudentPerfil** - Perfil e configurações do aluno
- **StaffDashboard** - Dashboard administrativo do funcionário
- **StaffCadastrar** - Cadastro de novas encomendas
- **StaffGerenciar** - Gerenciamento e filtros de encomendas
- **StaffGraficos** - Visualização de gráficos e estatísticas

**Componentes:**

- **ProtectedRoute** - Componente de rota protegida por autenticação
- **StudentLayout** - Layout base para páginas de aluno (sidebar + navegação)
- **StaffLayout** - Layout base para páginas de funcionário (sidebar + navegação)
- **StudentHeader** - Cabeçalho para páginas de aluno
- **UNASPLogo** - Componente do logotipo da instituição
- **StatCard** - Card de estatísticas reutilizável
- **StatusBadge** - Badge de status de encomenda
- **RegisterForm** - Formulário de cadastro
- **StudentView** - View de estudante
- **StaffView** - View de funcionário
- **Button** - Componente de botão customizado
- **Card** - Componente de card reutilizável
- **Input** - Componente de input customizado
- **Select** - Componente de select customizado
- **Textarea** - Componente de textarea customizado
- **Badge** - Componente de badge genérico
- **BrazilianDatePicker** - Seletor de data no formato brasileiro

## 6. 🔗 Conexão Frontend-Backend

**Comunicação:** REST API

**Método utilizado:** Dados mockados em localStorage (desenvolvimento) / Futuro: fetch/axios para API REST

**Configuração da API:**

- **URL base:** NÃO IDENTIFICADO - Backend roda em `http://localhost:3000` (variável PORT no .env)
- **Variáveis de ambiente:** Backend usa arquivo .env (não versionado) com DATABASE_HOST, DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME, JWT_SECRET
- **Proxy/CORS:** CORS habilitado no backend via middleware `cors()`

**Endpoints consumidos pelo frontend:**
**IMPORTANTE:** O frontend atualmente está usando dados mockados (localStorage) para desenvolvimento. A integração real com o backend ainda NÃO está implementada.

**Endpoints disponíveis no backend:**

- **POST /usuarios/register** → Registro de novo usuário (backend implementado)
- **POST /usuarios/login** → Login de usuário (backend implementado)
- **POST /encomendas** → Criar nova encomenda (backend implementado, protegido por auth)
- **GET /encomendas** → Listar encomendas com busca opcional (backend implementado, protegido por auth)
- **GET /encomendas/:id** → Buscar encomenda por ID (backend implementado, protegido por auth)
- **PATCH /encomendas/:id/status** → Atualizar status da encomenda (backend implementado, protegido por auth)
- **DELETE /encomendas/:id** → Deletar encomenda (backend implementado, protegido por auth)
- **POST /nomes-entrega** → Criar nome alternativo (backend implementado, protegido por auth)
- **GET /nomes-entrega** → Listar nomes alternativos (backend implementado, protegido por auth)
- **DELETE /nomes-entrega/:id** → Deletar nome alternativo (backend implementado, protegido por auth)

**Consumo no frontend:**

- Atualmente o frontend usa funções mockadas (`authenticateUser`, `registerUser`) em `frontend/src/app/data/mockData.ts`
- Persistência via localStorage através de `frontend/src/app/lib/storage.ts`
- O Context API em `AppContext.tsx` gerencia o estado mas não faz chamadas HTTP reais
- **NÃO há integração real entre frontend e backend no momento**

## 7. ✅ O Que Já Está Implementado

**Backend:**

- Sistema completo de autenticação (registro, login, JWT)
- Criptografia de senhas com bcrypt
- Middleware de autenticação para rotas protegidas
- CRUD completo de encomendas
- Sistema de histórico de status com transações
- Gerenciamento de nomes alternativos
- Busca de encomendas por código ou destinatário
- Conexão com banco de dados MySQL/MariaDB via Prisma
- Graceful shutdown do servidor
- Schema completo do banco de dados
- Migration inicial criada
- Script de seed para dados iniciais
- Script utilitário para preencher códigos UUID

**Frontend:**

- Sistema de autenticação com login e cadastro
- Roteamento completo com React Router
- Proteção de rotas por tipo de usuário (aluno/funcionário)
- Dashboard de aluno com estatísticas
- Dashboard de funcionário com estatísticas
- Consulta e filtro de encomendas
- Cadastro de novas encomendas (interface)
- Gerenciamento de encomendas (interface)
- Visualização de histórico
- Sistema de temas (light/dark) com persistência
- Layouts responsivos para desktop e mobile
- Componentes UI reutilizáveis
- Sistema de notificações toast (Sonner)
- Persistência de dados no localStorage
- Formatação de datas no padrão brasileiro
- Sistema de busca e filtros
- Modais de confirmação para ações críticas

**Banco de Dados:**

- Modelo completo com 10 tabelas principais
- Relacionamentos bem definidos
- Índices para otimização
- Enums para padronização
- Timestamps automáticos
- Sistema de códigos únicos (cuid)
- Cascata configurada para deleções

## 8. 🚧 O Que Parece Incompleto ou Em Desenvolvimento

- **Integração Frontend-Backend:** Frontend usa dados mockados (localStorage), não consome a API REST do backend
- **Chamadas HTTP:** Não há implementação de fetch/axios no frontend para conectar com o backend
- **Variáveis de Ambiente:** Falta arquivo .env no backend (apenas .env.example esperado)
- **Autenticação Real:** Login no frontend não valida contra o backend, usa credenciais hardcoded
- **Sistema de Notificações:** Tabela de notificações existe no banco mas não há implementação no backend/frontend
- **Autorização de Retirada:** Tabela de autorizações existe mas não há funcionalidade implementada
- **Auditoria:** Tabela de auditoria existe mas não há sistema de logs implementado
- **Gráficos:** Página de gráficos existe no frontend mas não tem implementação real (vazia)
- **Perfil de Usuário:** Página de perfil existe mas funcionalidades de edição não implementadas
- **Upload de Arquivos:** Não há sistema de upload de comprovantes ou imagens
- **Sistema de Emails:** Não há envio de notificações por email
- **Gestão de Funcionários:** Não há CRUD de funcionários (tabela existe mas sem rotas)
- **Gestão de Remetentes:** Não há CRUD de remetentes (tabela existe mas sem rotas)
- **Gestão de Status:** Status de encomenda está hardcoded, não há CRUD de status
- **Filtros Avançados:** Página de filtros existe mas funcionalidade limitada
- **Documentação da API:** Não há documentação Swagger/OpenAPI
- **Testes:** Não há testes unitários ou de integração
- **Docker:** Não há configuração Docker/docker-compose
- **CI/CD:** Não há pipeline de integração contínua
- **Validação de Dados:** Falta validação robusta de entrada (backend)
- **Tratamento de Erros:** Tratamento de erros genérico, pode ser melhorado
- **Paginação:** Não há paginação nas listagens
- **Rate Limiting:** Não há proteção contra abuso de API
- **HTTPS:** Não configurado (produção)
- **Logs Estruturados:** Console.log básico, falta sistema de logs profissional

## 9. 📦 Dependências Principais

**Backend:**

- **@prisma/adapter-mariadb** - ^7.8.0 (Adapter para MariaDB)
- **@prisma/client** - ^7.8.0 (Cliente Prisma ORM)
- **bcrypt** - ^6.0.0 (Criptografia de senhas)
- **cors** - ^2.8.6 (Middleware CORS)
- **dotenv** - ^17.4.2 (Variáveis de ambiente)
- **express** - ^5.2.1 (Framework web)
- **jsonwebtoken** - ^9.0.3 (Geração e validação de JWT)
- **uuid** - ^14.0.0 (Geração de UUIDs)
- **uuidv7** - ^1.2.1 (Geração de UUIDs v7)
- **prisma** - ^7.8.0 (CLI do Prisma - devDependency)

**Frontend:**

- **react** - ^18.3.1 (Biblioteca UI)
- **react-dom** - ^18.3.1 (React para DOM)
- **react-router-dom** - ^7.13.1 (Roteamento)
- **chart.js** - ^4.5.1 (Biblioteca de gráficos)
- **react-chartjs-2** - ^5.3.1 (Wrapper React para Chart.js)
- **lucide-react** - ^0.487.0 (Ícones)
- **sonner** - ^1.7.4 (Sistema de toast notifications)
- **tailwindcss** - ^4.0.9 (Framework CSS)
- **typescript** - ^5.6.3 (Superset JavaScript tipado)
- **vite** - ^5.4.11 (Bundler e dev server)
- **@vitejs/plugin-react** - ^4.3.4 (Plugin Vite para React)
- **@types/react** - ^18.3.18 (Tipos TypeScript para React)
- **@types/react-dom** - ^18.3.5 (Tipos TypeScript para React DOM)
- **@types/react-router-dom** - ^5.3.3 (Tipos para React Router)
- **autoprefixer** - ^10.4.20 (PostCSS plugin)
- **postcss** - ^8.5.3 (Processador CSS)

## 10. 🔍 Observações Adicionais

**Padrões de Projeto Identificados:**

- **Arquitetura em Camadas:** Backend segue separação clara entre Routes → Controllers → Services → Prisma ORM
- **Service Layer Pattern:** Lógica de negócio isolada em camada de services
- **Repository Pattern (implícito):** Prisma ORM funciona como camada de repositório
- **Middleware Pattern:** Autenticação JWT implementada como middleware reutilizável
- **Context API Pattern:** Estado global gerenciado via React Context
- **Protected Routes Pattern:** Rotas protegidas com componente HOC
- **Compound Components:** Layouts e componentes compostos (StudentLayout, StaffLayout)
- **Feature-Based Organization:** Frontend organizado por features (student, staff)

**Arquitetura:**

- **Backend:** MVC modificado (Model-View-Controller), onde Views são substituídas por API REST
- **Frontend:** Component-Based Architecture com separação por features
- **Banco de Dados:** Relacional com esquema normalizado

**Pontos de Atenção:**

1. **Desconexão Frontend-Backend:** A maior lacuna é a falta de integração real entre frontend e backend. O backend está funcional mas o frontend não o consome.
2. **Dados Mockados:** Todo o frontend funciona com localStorage, precisará de refatoração para integrar com API.
3. **Segurança:** JWT_SECRET em variável de ambiente (bom), mas falta validação robusta de entrada e rate limiting.
4. **Escalabilidade:** Falta paginação, pode gerar problemas com muitos registros.
5. **Observabilidade:** Falta sistema de logs estruturado e monitoramento.
6. **Testes:** Ausência completa de testes automatizados.
7. **Documentação:** Falta documentação da API (Swagger) e comentários no código.
8. **Ambiente:** Falta configuração Docker para facilitar deploy.
9. **Validação:** Backend aceita dados sem validação rigorosa de schema (pode usar Zod ou Joi).
10. **Error Handling:** Tratamento de erros genérico, deveria ter error handling middleware.

**Sugestões de Melhoria (NÃO IMPLEMENTADAS, APENAS ANÁLISE):**

- Implementar camada de requisições HTTP no frontend (axios/fetch)
- Adicionar validação de dados com Zod ou Joi
- Implementar testes com Jest/Vitest
- Adicionar documentação Swagger/OpenAPI
- Criar docker-compose para desenvolvimento
- Implementar sistema de logs com Winston ou Pino
- Adicionar paginação nas listagens
- Implementar rate limiting com express-rate-limit
- Melhorar tratamento de erros com middleware centralizado
- Adicionar variáveis de ambiente para URL da API no frontend

**Tecnologias Modernas Utilizadas:**

- ES Modules no backend (type: "module")
- React 18 com hooks modernos
- TypeScript para type safety
- Prisma ORM com esquema declarativo
- TailwindCSS 4 (versão mais recente)
- React Router v7
- Vite como bundler (rápido)
- Context API para estado global (alternativa ao Redux)

**Conclusão:**
O projeto tem uma base sólida com backend bem estruturado e frontend moderno, mas carece de integração entre as duas partes. O backend está pronto para receber requisições, mas o frontend ainda opera isoladamente com dados mockados. A arquitetura é limpa e escalável, seguindo boas práticas de separação de responsabilidades. O próximo passo crítico seria implementar a camada de comunicação HTTP no frontend para conectar com a API REST do backend.
