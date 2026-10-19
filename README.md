# Intertrack

Aplicação de gerenciamento de encomendas. Monorepositório com projetos npm independentes:

- `frontend/`: React 18 + TypeScript + Vite 6 + Tailwind CSS; React Router 7 (`createBrowserRouter`/`RouterProvider`).
- `backend/`: Node.js ESM + Express 5, JWT/Bcrypt, Prisma 7 com adapter MariaDB para MySQL.
- `backend/prisma/`: schema, quatro migrations e seed explícito. Client gerado em `backend/generated/prisma/` (não versionado).

Use Node **24.11.1** (arquivos `.node-version`; engines `>=24.11.0 <25`).
Frontend: `dev`, `build` (TypeScript + Vite), `preview`.
Backend: `dev` (watch nativo do Node), `build` (Prisma Client), `start`, `test`, `db:deploy`.

## Deploy

### Frontend — Hostinger / Apache

1. Abra `frontend/` e execute `npm install` (ou `npm ci` para reproduzir o lockfile).
2. Copie `.env.example` para `.env.production` e preencha `VITE_API_URL` com a **URL HTTPS real do backend**, sem barra final e sem `/api` (as rotas do Express começam em `/usuarios`, `/encomendas` e `/nomes-entrega`). Nenhum domínio de produção foi definido nesta auditoria.
3. Execute `npm run build`. O build de produção recusa URL ausente, HTTP ou localhost. Tudo em `VITE_*` é público e incorporado no build; nunca use segredos.
4. Execute `npm run preview` e abra o endereço mostrado com `/tecti/2026/gpec11/`. Verifique login e chamadas da API quando o backend real estiver disponível.
5. No FileZilla, abra localmente `frontend/dist/`. No servidor, abra a pasta correspondente a `/tecti/2026/gpec11/`.

> Transfira o CONTEÚDO da pasta `dist` para a pasta correspondente ao projeto no servidor Apache.

Envie `index.html`, `assets/`, `.htaccess`, `campus.png`, `logoazul.webp`, `logolaranja.png` e `logounasp.png`. Ative a exibição de arquivos ocultos e confirme o envio de `.htaccess`.
Não envie `src/`, `node_modules/`, `.env*` ou `package.json`. Não crie uma pasta `dist/` intermediária no destino.

O `base` do Vite é `/tecti/2026/gpec11/`. O router deriva seu `basename` de `import.meta.env.BASE_URL`, resultando em `/tecti/2026/gpec11`. Imagens públicas usam a mesma base.
`public/.htaccess` é copiado para a raiz de `dist/`: arquivos e diretórios existentes são preservados e rotas SPA recebem `index.html`.
O Apache precisa permitir `.htaccess` (`AllowOverride FileInfo`) e ter `mod_rewrite` ativo. Teste acesso direto e recarga de `/tecti/2026/gpec11/aluno/consultar`.
Se o caminho mudar, ajuste `frontend/vite.config.ts` e `frontend/public/.htaccess` e gere novo build.

**A dist gerada durante a auditoria usa `https://api-build-check.invalid`, exclusivamente para validação. Não a publique: configure a URL real e gere novamente.**
Alterações em `.env.production` só têm efeito após novo build. Esse arquivo não é interpretado pelo Apache.
Em desenvolvimento, `.env.development` usa `/api`, encaminhado pelo Vite ao backend local na porta 3000.

### Backend

Em `backend/`:

```sh
npm install
# Configure .env a partir de .env.example, sem versioná-lo.
npm run build
npm test
npm start
```

`npm start` executa `node src/server.js`, sem nodemon. O servidor conecta ao banco antes de ouvir em `0.0.0.0`, usa `PORT` (padrão 3000), atende `GET /health` com `{"status":"ok"}` e trata SIGTERM/SIGINT. O health check confirma o processo HTTP, não a disponibilidade contínua do banco.

Configuração manual no Render, Web Service conectado ao GitHub:

| Campo | Valor |
|---|---|
| Root Directory | `backend` |
| Runtime | Node |
| Build Command | `npm ci --include=dev && npm run build` |
| Start Command | `npm start` |
| Health Check Path | `/health` |
| NODE_ENV | `production` |

Use a versão do Node declarada em `backend/.node-version`; remova eventuais overrides conflitantes. O Render fornece `PORT`.
Configure os demais valores no painel de variáveis de ambiente. Não coloque credenciais no GitHub/README.
Migrations são uma etapa controlada separada: execute `npm run db:deploy` antes de liberar tráfego, após backup e revisão do banco de destino. Não rode migrations no start a cada reinício.

### Variáveis

Frontend:

- `VITE_API_URL`: URL pública HTTPS da API, resolvida no build.

Backend:

- `NODE_ENV=production` na hospedagem.
- `PORT`: fornecida pelo serviço; padrão local 3000.
- `DATABASE_URL`: `mysql://USUARIO:SENHA@HOST:PORTA/BANCO`, com caracteres especiais codificados por percent-encoding. É a fonte única de host, porta, usuário, senha e banco para runtime e CLI; os antigos `DATABASE_HOST/USER/PASSWORD/NAME/PORT` não são mais usados.
- `DATABASE_SSL`: `true` quando o provedor exige TLS (recomendado para conexão externa); `false` apenas quando apropriado ao ambiente.
- `DATABASE_SSL_CA`: opcional, certificado CA PEM do provedor, aceita quebras de linha ou `\n`. A verificação do certificado permanece ativa.
- `JWT_SECRET`: segredo aleatório exclusivo, mínimo 32 caracteres em produção. Nunca reutilize valores de teste.
- `FRONTEND_URL`: URL HTTPS real do frontend. Pode incluir `/tecti/2026/gpec11/`; CORS extrai somente a origem (protocolo + domínio + porta). Caminho não faz parte do header Origin. Em desenvolvimento o padrão é `http://localhost:5173`. Autenticação atual usa Bearer token, sem cookies cross-site.
- `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD`: opcionais, somente para bootstrap manual; senha de pelo menos 12 caracteres. Remova essas variáveis do serviço após criar o administrador.

### Banco

MySQL externo via Prisma e `@prisma/adapter-mariadb`. Configure permissões de rede/IP, usuário com privilégios mínimos e TLS segundo o provedor.
**TLS da CLI é configurado na `DATABASE_URL` com os parâmetros MySQL do Prisma, por exemplo `sslaccept=strict` e `sslcert` quando houver CA própria; as variáveis DATABASE_SSL/CA controlam somente o runtime.** Disponibilize o certificado à CLI no caminho indicado e valide ambos os clientes antes de publicar.

```sh
npx prisma generate
npx prisma validate
npx prisma migrate status
npx prisma migrate deploy
# Somente na preparação manual do banco, após revisar o destino:
npx prisma db seed
```

Existem quatro migrations: criação inicial (`20260908111928_corrigindo_nomes`), `retirado_por`, separação de nomes alternativos/autorizados e autorização por encomenda. A terceira contém um UPDATE que classifica os registros existentes como autorizados; revise esse efeito antes de aplicar. Não foram alteradas nem executadas nesta auditoria.
Em banco já existente, confira histórico `_prisma_migrations` e divergências antes de `migrate deploy`; se necessário, planeje baseline, sem recriar tabelas ou usar reset.
O seed cria/atualiza os três status fixos usados pelo frontend e, opcionalmente, cria o primeiro administrador. Não cria mais contas de teste e não muda senhas de contas existentes.
**Se o seed antigo foi executado, substitua as senhas conhecidas e desative contas de teste antes de publicar.** Remover as senhas do código não invalida contas existentes ou o histórico Git.
Nunca use `prisma migrate reset` neste fluxo.

### Validação e limites

A auditoria não realizou deploy, FTP, commit, push, migrations, seed ou alterações em dados.
Build foi testado com endereço reservado de validação. Preview HTTP verificou página, rota interna, CSS/JS e imagens. Backend foi testado em porta isolada, incluindo health e CORS. A validação no Apache real, no Linux do Render, TLS externo e os fluxos completos com o domínio definitivo devem ser feitos antes da liberação.

Referências: [Render Web Services](https://render.com/docs/web-services), [versão do Node](https://render.com/docs/node-version), [health checks](https://render.com/docs/health-checks), [Prisma MySQL](https://docs.prisma.io/docs/orm/v6/overview/databases/mysql).
