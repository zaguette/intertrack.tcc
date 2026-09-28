# Relatório de integração com o banco de dados

**Projeto:** Intertrack  
**Escopo:** integração entre front-end React, API Express, Prisma e MySQL  
**Data da verificação:** 28/09/2026

## 1. Resumo executivo

O projeto possui as quatro partes necessárias para integração: formulários no front-end, funções HTTP, rotas/controllers no back-end e modelos Prisma ligados ao MySQL. O banco local está acessível e contém as tabelas criadas pela migração.

Entretanto, o fluxo principal de encomendas ainda não chega corretamente ao banco. O front-end envia identificadores obrigatórios vazios, utiliza nomes de status onde a API espera UUIDs e, quando a requisição falha, salva os dados no estado do React e no `localStorage`. Isso faz a interface aparentar sucesso mesmo sem persistência no MySQL.

Os principais ajustes necessários são alinhar os contratos de dados, definir como RA e status serão resolvidos para IDs, remover fallbacks silenciosos e validar os fluxos utilizando dados reais do banco.

## 2. Caminho esperado de uma encomenda

```text
StaffCadastrar.tsx
        |
        v
AppContext.addPackage()
        |
        v
adapters.ts -> conversão para o contrato da API
        |
        v
api.ts -> POST /api/encomendas
        |
        v
Proxy do Vite -> http://localhost:3000/encomendas
        |
        v
encomendaRoutes.js -> autenticação e autorização
        |
        v
encomendaController.create()
        |
        v
encomendas.services.js
        |
        v
Transação Prisma -> encomenda + historico_status
        |
        v
Resposta HTTP 201 -> atualização da interface
```

No estado atual, a falha ocorre principalmente na conversão dos dados no front-end. Após essa falha, o sistema segue pelo caminho local:

```text
Erro na API -> catch em AppContext -> estado do React -> localStorage
```

## 3. Problemas de integração confirmados

### 3.1 Cadastro de encomenda envia chaves estrangeiras vazias

**Local:** `frontend/src/app/lib/adapters.ts`

O adaptador envia:

```ts
destinatario_usuario_id: ""
status_atual_id: ""
```

Esses campos são obrigatórios e relacionados às tabelas `usuario` e `status_encomenda`. O MySQL/Prisma não consegue criar uma encomenda válida com esses valores.

**Correção necessária:** definir uma única estratégia:

1. O front consulta usuários e status e envia os respectivos IDs; ou
2. O front envia `ra` e um código de status estável, e o back-end resolve os IDs antes da transação.

A segunda alternativa reduz a dependência do front-end em UUIDs internos. O `funcionario_id` não deve ser informado pelo formulário: o controller já o obtém do JWT por `req.user.id`.

### 3.2 Status textual é enviado onde a API espera um ID

**Locais:**

- `frontend/src/app/context/AppContext.tsx`
- `frontend/src/app/lib/api.ts`
- `backend/src/controllers/encomendaController.js`

O front trabalha com valores como `disponivel` e `entregue`. A rota `PATCH /encomendas/:id/status` espera `status_atual_id`, que no banco é um `CHAR(36)` relacionado a `status_encomenda`.

**Correção necessária:** utilizar um código estável para cada status, por exemplo `DISPONIVEL` e `ENTREGUE`, resolvendo o UUID no back-end, ou carregar o catálogo do banco e trabalhar com o ID real no front-end.

### 3.3 Resposta do Prisma não possui o formato esperado pelas telas

**Locais:**

- `backend/src/services/encomendas.services.js`
- `frontend/src/app/lib/types.ts`
- `frontend/src/app/context/AppContext.tsx`

A API retorna campos como:

- `codigo_rastreio`;
- `created_at`;
- `data_entrega`;
- `destinatario.nome`;
- `statusAtual.nome_status`.

As telas esperam campos como:

- `codigo`;
- `dataChegada`;
- `dataRetirada`;
- `aluno`;
- `ra`;
- `status`.

A função atual apenas normaliza `status` e não converte os demais campos.

**Correção necessária:** criar um adaptador explícito de resposta, por exemplo `fromEncomendaApi()`, ou fazer a API retornar um DTO já compatível com a interface. A listagem também precisa retornar o RA do destinatário.

### 3.4 Banco vazio é interpretado como falha e substituído por mocks

**Local:** `frontend/src/app/context/AppContext.tsx`

O resultado da API somente é utilizado quando o array possui pelo menos um item. Quando a API responde corretamente com `[]`, o front carrega `localStorage` ou `mockPackages`.

**Correção necessária:** aceitar qualquer array retornado com sucesso, inclusive vazio. Mock deve ser ativado somente por configuração explícita de demonstração, nunca como consequência automática de banco vazio.

### 3.5 Erros da API são mascarados por fallback local

**Locais:**

- `frontend/src/app/context/AppContext.tsx`
- `frontend/src/app/data/mockData.ts`
- `frontend/src/app/lib/storage.ts`

Atualmente:

- login inválido na API pode cair no login mockado;
- cadastro de usuário com erro pode ser salvo localmente;
- cadastro de encomenda com erro é inserido na lista local;
- dados locais são persistidos no `localStorage`.

**Correção necessária:** em modo integrado, retornar o erro para a página e não alterar o estado local. Se for necessário manter um modo demonstrativo, ele deve ser controlado por uma variável como `VITE_USE_MOCKS=true` e ficar desativado durante os testes de integração.

### 3.6 A interface confirma sucesso antes da resposta do back-end

**Locais:**

- `frontend/src/app/pages/staff/StaffCadastrar.tsx`
- `frontend/src/app/pages/staff/StaffDashboard.tsx`

As funções assíncronas de criação, atualização e exclusão não são aguardadas antes da exibição do `toast.success`.

**Correção necessária:** usar `await`, fazer as funções do contexto retornarem sucesso ou erro e exibir confirmação somente após uma resposta HTTP bem-sucedida. Em caso de falha, manter o formulário preenchido e mostrar uma mensagem clara.

### 3.7 Contrato de login está divergente

**Locais:**

- `frontend/src/app/lib/api.ts`
- `backend/src/controllers/userController.js`

O front envia `{ ra, senha }`, enquanto o controller lê `{ email, senha }`. Além disso, após login real, o contexto define todo usuário retornado como `tipo: "aluno"`, mesmo quando a API informa `funcionario`.

Essa divergência impede obter corretamente o JWT de funcionário necessário para cadastrar e atualizar encomendas.

**Correção necessária:** definir se o identificador de login será RA, e-mail ou ambos, usar o mesmo campo nas duas camadas e preservar `resp.user.tipo` e `resp.user.cargo` no estado do front-end.

### 3.8 Processo ativo na porta da API não correspondeu ao código atual

**Locais envolvidos:**

- `frontend/vite.config.ts`
- `backend/src/server.js`

Durante a verificação, havia um processo Node na porta `3000`, mas `GET /` retornou HTTP 404. Pelo código atual de `server.js`, essa rota deveria responder com a mensagem `Intertrack API online!`. Os cabeçalhos CORS observados também eram diferentes do `cors()` presente no arquivo.

**Correção necessária:** encerrar processos antigos e iniciar o back-end a partir da pasta correta. Antes de testar o front-end, confirmar que `http://localhost:3000/` responde conforme o código atual.

### 3.9 Serviço de nomes alternativos não corresponde ao schema

**Locais:**

- `backend/src/services/nomeEntrega.service.js`
- `backend/prisma/schema.prisma`

O serviço recebe e grava `nome` e `tipo`, mas o modelo Prisma define `nome_completo`, `documento` e `parentesco`.

**Correção necessária:** alinhar o payload e o serviço aos nomes reais do schema, além de validar que o registro excluído pertence ao usuário autenticado.

### 3.10 Seed não corresponde ao schema atual

**Local:** `backend/prisma/seed.js`

O seed usa `prisma.tiposUsuario`, modelo que não existe no schema atual, e cria status com IDs numéricos, embora o modelo utilize IDs `String @db.Char(36)` e exija o campo `codigo`.

**Correção necessária:** atualizar o seed para criar, no mínimo:

- status utilizados pela interface;
- um funcionário válido para testes;
- opcionalmente, um aluno e encomendas de demonstração.

As senhas de teste devem ser geradas com o mesmo procedimento usado pelo controller.

### 3.11 Atualização de retirada não persiste todos os dados

**Locais:**

- `frontend/src/app/pages/staff/StaffDashboard.tsx`
- `backend/src/services/encomendas.services.js`

Ao confirmar uma retirada, o front atualiza localmente `dataRetirada`, `collectedAt`, `collectedBy` e `collectedByRa`. A API de status recebe somente `status_atual_id`, e o service atualiza apenas o status e o histórico.

**Correção necessária:** definir quais dados de retirada são obrigatórios no domínio e criar um contrato de entrega que persista pelo menos `data_entrega`. Caso nome e RA de quem retirou sejam necessários, eles precisam estar representados no schema ou na autorização utilizada.

### 3.12 Exclusão pode ser oferecida a usuários sem permissão

**Locais:**

- `frontend/src/app/pages/staff/StaffDashboard.tsx`
- `backend/src/routes/encomendaRoutes.js`

O front apresenta exclusão para funcionário, mas o back-end permite somente `administrador` e `supervisor`. Sem preservar o cargo no login, a interface não consegue decidir corretamente quando mostrar a ação.

**Correção necessária:** preservar o cargo no usuário autenticado e ocultar ou desabilitar ações incompatíveis. A validação definitiva deve continuar no back-end.

## 4. Validações que devem ser definidas

### 4.1 Cadastro de usuário

- `nome`, `ra`, `email` e `senha` obrigatórios;
- remover espaços excedentes antes da gravação;
- validar formato básico do e-mail;
- validar tamanho dos campos conforme o schema;
- verificar RA e e-mail duplicados;
- retornar `400` para dados inválidos e `409` para duplicidade;
- nunca confirmar sucesso no front-end antes do HTTP `201`;
- após cadastrar, confirmar a existência do usuário no banco.

### 4.2 Login

- definir claramente se aceita RA, e-mail ou ambos;
- exigir identificador e senha;
- recusar usuário ou funcionário inativo;
- devolver `id`, `nome`, `tipo`, `cargo` quando aplicável e token;
- validar que o front preserva `tipo` e `cargo` retornados;
- remover o token no logout;
- impedir que falha na API seja convertida automaticamente em login mockado.

### 4.3 Cadastro de encomenda

- exigir código de rastreio, destinatário e status inicial;
- localizar o destinatário por RA e confirmar que está ativo;
- confirmar que o status existe;
- obter o funcionário exclusivamente do JWT;
- validar tamanhos máximos de código, descrição e observações;
- definir se código de rastreio repetido será permitido;
- criar encomenda e primeiro histórico na mesma transação;
- se qualquer etapa falhar, não manter uma encomenda apenas localmente;
- responder com a encomenda já convertida para o formato usado pelo front-end.

### 4.4 Atualização de status e entrega

- confirmar que a encomenda existe;
- confirmar que o status de destino existe;
- definir transições permitidas, por exemplo `recebida -> disponivel -> entregue`;
- ao entregar, exigir os dados de retirada definidos pela regra do projeto;
- preencher `data_entrega` no banco;
- criar histórico somente quando a alteração for concluída;
- impedir que a interface altere o estado local quando a API falhar.

### 4.5 Exclusão

- confirmar existência da encomenda;
- exigir cargo `administrador` ou `supervisor`;
- retornar `404` quando não encontrada e `403` quando não autorizado;
- remover da interface somente após resposta bem-sucedida;
- verificar o comportamento das relações dependentes dentro da transação/modelagem atual.

### 4.6 Nomes alternativos

- exigir `nome_completo`;
- validar `parentesco` conforme o enum Prisma;
- validar documento quando informado;
- associar sempre ao usuário do JWT;
- permitir listar e remover apenas registros do próprio usuário.

## 5. Sequência recomendada de correção

1. Garantir que somente o back-end deste projeto esteja rodando na porta configurada.
2. Atualizar e executar o seed compatível com o schema atual.
3. Unificar o contrato de login e preservar tipo/cargo no front-end.
4. Definir o contrato de criação de encomenda usando RA/código de status ou IDs reais.
5. Criar o adaptador de resposta da API para `PackageItem`.
6. Corrigir atualização de status e persistência da retirada.
7. Remover os fallbacks automáticos durante o modo integrado.
8. Fazer telas aguardarem a resposta da API antes de informar sucesso.
9. Corrigir nomes alternativos e demais funções dependentes do banco.
10. Executar os testes manuais de aceite descritos abaixo.

## 6. Validações manuais de aceite

### Cenário A — banco vazio

1. Limpar apenas os dados de teste de forma controlada.
2. Abrir o sistema.
3. Confirmar que as listas aparecem vazias.
4. Confirmar que nenhum mock é exibido automaticamente.

**Resultado esperado:** resposta `[]` da API é tratada como válida.

### Cenário B — cadastro e login de aluno

1. Cadastrar um aluno pela interface.
2. Confirmar HTTP `201` no navegador.
3. Consultar a tabela `usuario` e confirmar uma nova linha.
4. Fazer login com o identificador definido.
5. Confirmar recebimento e uso do JWT.

**Resultado esperado:** o usuário permanece disponível após atualizar a página e reiniciar front-end e back-end.

### Cenário C — login de funcionário

1. Entrar com um funcionário criado pelo seed.
2. Confirmar que o front identifica `tipo: funcionario` e o cargo correto.
3. Acessar as telas administrativas.

**Resultado esperado:** o token permite acessar `POST /encomendas`.

### Cenário D — cadastro de encomenda

1. Informar um RA existente e ativo.
2. Cadastrar uma encomenda.
3. Confirmar HTTP `201`.
4. Confirmar uma linha em `encomenda`.
5. Confirmar uma linha correspondente em `historico_status`.
6. Atualizar a página e verificar se o registro continua visível.

**Resultado esperado:** não existe dependência de `localStorage` para manter a encomenda.

### Cenário E — consulta do aluno

1. Entrar como o destinatário da encomenda.
2. Consultar dashboard, busca e histórico.
3. Confirmar que somente encomendas daquele usuário são retornadas.

**Resultado esperado:** nome, RA, código, datas e status são exibidos usando dados da API.

### Cenário F — atualização e retirada

1. Alterar o status como funcionário.
2. Confirmar alteração em `encomenda.status_atual_id`.
3. Confirmar novo registro em `historico_status`.
4. Registrar retirada.
5. Confirmar `data_entrega` e demais dados definidos no banco.
6. Atualizar a página e conferir a permanência das alterações.

**Resultado esperado:** interface e banco apresentam o mesmo estado.

### Cenário G — falha proposital da API

1. Parar o back-end.
2. Tentar cadastrar ou atualizar uma encomenda.

**Resultado esperado:** a interface mostra erro, não exibe sucesso e não cria registro apenas no estado/localStorage.

## 7. Critérios para considerar a integração concluída

A integração pode ser considerada funcional quando:

- login real de aluno e funcionário funciona sem mocks;
- token, tipo e cargo são utilizados corretamente;
- encomendas são criadas, consultadas, atualizadas e excluídas conforme as permissões;
- criação e atualização geram histórico no banco;
- dados retornados pelo Prisma aparecem corretamente nas telas;
- banco vazio não ativa dados simulados;
- falhas da API são mostradas como falhas;
- os dados continuam disponíveis após recarregar a página e reiniciar a aplicação;
- os cenários manuais de aceite são concluídos sem depender do `localStorage`.

## 8. Arquivos principais envolvidos

- `frontend/vite.config.ts`
- `frontend/src/app/lib/api.ts`
- `frontend/src/app/lib/adapters.ts`
- `frontend/src/app/context/AppContext.tsx`
- `frontend/src/app/pages/LoginPage.tsx`
- `frontend/src/app/pages/staff/StaffCadastrar.tsx`
- `frontend/src/app/pages/staff/StaffDashboard.tsx`
- `backend/src/server.js`
- `backend/src/routes/userRoutes.js`
- `backend/src/routes/encomendaRoutes.js`
- `backend/src/controllers/userController.js`
- `backend/src/controllers/encomendaController.js`
- `backend/src/services/encomendas.services.js`
- `backend/src/services/nomeEntrega.service.js`
- `backend/prisma/schema.prisma`
- `backend/prisma/seed.js`

