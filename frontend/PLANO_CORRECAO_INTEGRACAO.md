# Plano de correção da integração com o banco de dados

**Projeto:** Intertrack  
**Objetivo:** fazer os fluxos principais utilizarem efetivamente React, API Express, Prisma e MySQL, sem depender de mocks ou `localStorage`.  
**Documento de referência:** `../RELATORIO_INTEGRACAO_BANCO.md`

## Resultado esperado

Ao concluir este plano, o sistema deverá permitir:

- cadastrar e autenticar alunos e funcionários pela API;
- identificar corretamente tipo e cargo do usuário autenticado;
- cadastrar uma encomenda para um RA existente;
- consultar as encomendas salvas no MySQL;
- atualizar status e registrar retirada;
- excluir encomendas conforme as permissões;
- recarregar ou reiniciar a aplicação sem perder os dados;
- apresentar erro quando a API falhar, sem simular sucesso localmente.

## Ordem de execução

As etapas devem ser realizadas na ordem abaixo, pois as posteriores dependem das anteriores.

```text
1. Ambiente e banco
        ↓
2. Contratos da API
        ↓
3. Autenticação
        ↓
4. Leitura de encomendas
        ↓
5. Cadastro de encomendas
        ↓
6. Status e retirada
        ↓
7. Exclusão e permissões
        ↓
8. Remoção dos fallbacks
        ↓
9. Validação integrada
```

---

## Etapa 1 — Estabilizar ambiente e banco

### Objetivo

Garantir que o front-end esteja chamando o back-end correto e que o Prisma utilize o schema atual.

### Tarefas

1. Confirmar que não existe outro processo ocupando a porta `3000`.
2. Iniciar o back-end a partir da pasta `backend`.
3. Confirmar que `GET http://localhost:3000/` retorna a mensagem definida em `backend/src/server.js`.
4. Regenerar o Prisma Client depois de qualquer alteração no schema.
5. Aplicar as migrations no banco local.
6. Corrigir `backend/prisma/seed.js` para o schema atual.
7. Criar pelo seed:
   - os status usados pelo sistema;
   - um funcionário de teste;
   - opcionalmente um aluno de teste.
8. Documentar as variáveis necessárias em um `.env.example`, sem incluir senhas reais.

### Arquivos envolvidos

- `backend/src/server.js`
- `backend/src/config/prisma.js`
- `backend/prisma/schema.prisma`
- `backend/prisma/seed.js`
- `frontend/vite.config.ts`

### Critérios de aceite

- A rota raiz responde HTTP `200`.
- O back-end inicia sem erro de conexão.
- Consultas Prisma funcionam para todas as tabelas usadas.
- Existem no banco os status necessários e pelo menos um funcionário válido.

---

## Etapa 2 — Definir contratos únicos entre front-end e API

### Objetivo

Eliminar divergências de nomes, tipos e identificadores.

### Decisões necessárias

Adotar contratos explícitos para cada operação. Uma sugestão é:

### Login

```json
{
  "identificador": "RA ou e-mail",
  "senha": "senha informada"
}
```

### Cadastro de encomenda

```json
{
  "codigo_rastreio": "ENC-2026-001",
  "ra_destinatario": "123456",
  "status_codigo": "DISPONIVEL",
  "descricao": "Caixa pequena",
  "observacoes": "Opcional"
}
```

O back-end deve obter `funcionario_id` pelo JWT e resolver internamente:

- `ra_destinatario` para `destinatario_usuario_id`;
- `status_codigo` para `status_atual_id`.

### Resposta de encomenda para o front-end

```json
{
  "id": "uuid",
  "codigo": "ENC-2026-001",
  "aluno": "Nome do aluno",
  "ra": "123456",
  "dataChegada": "2026-09-28",
  "dataRetirada": null,
  "status": "disponivel"
}
```

### Tarefas

1. Registrar os contratos escolhidos em um arquivo compartilhado ou na documentação da API.
2. Ajustar os controllers para validar esses contratos.
3. Criar um DTO no back-end ou um adaptador no front-end para converter a resposta Prisma.
4. Padronizar mensagens e códigos HTTP.

### Critérios de aceite

- Front-end e back-end utilizam os mesmos nomes de campos.
- UUIDs internos não precisam ser digitados pelo usuário.
- A resposta da API pode ser utilizada diretamente pelas telas ou por um único adaptador documentado.

---

## Etapa 3 — Corrigir autenticação

### Objetivo

Obter um JWT real e preservar corretamente o perfil do usuário.

### Tarefas no back-end

1. Alterar o login para receber o identificador definido na Etapa 2.
2. Procurar aluno por RA/e-mail e funcionário por e-mail, conforme a regra escolhida.
3. Manter no retorno:
   - `id`;
   - `nome`;
   - `ra`, quando aluno;
   - `email`;
   - `tipo`;
   - `cargo`, quando funcionário;
   - `token`.
4. Manter a verificação de usuário ativo.

### Tarefas no front-end

1. Ajustar `src/app/lib/api.ts` para enviar o contrato correto.
2. Em `src/app/context/AppContext.tsx`, utilizar `resp.user.tipo` em vez de definir sempre `aluno`.
3. Preservar o cargo do funcionário no tipo `User`.
4. Remover o token em `logout()`.
5. Parar de chamar `authenticateUser()` quando a API rejeitar credenciais no modo integrado.
6. Exibir a mensagem retornada pela API.

### Arquivos envolvidos

- `src/app/lib/api.ts`
- `src/app/lib/types.ts`
- `src/app/context/AppContext.tsx`
- `src/app/pages/LoginPage.tsx`
- `backend/src/controllers/userController.js`
- `backend/src/middlewares/auth.js`

### Critérios de aceite

- Aluno entra e é enviado para `/aluno`.
- Funcionário entra e é enviado para `/funcionario`.
- O token é enviado nas requisições protegidas.
- Credenciais inválidas não abrem uma sessão mockada.
- Logout remove sessão e token.

---

## Etapa 4 — Corrigir a leitura de encomendas

### Objetivo

Carregar as encomendas do MySQL no formato correto.

### Tarefas no back-end

1. Incluir na consulta:
   - destinatário com `nome` e `ra`;
   - status atual;
   - datas necessárias;
   - dados de retirada definidos para o projeto.
2. Converter o resultado para o DTO acordado.
3. Manter o filtro para aluno visualizar apenas as próprias encomendas.

### Tarefas no front-end

1. Implementar `fromEncomendaApi()` caso a conversão não seja feita pelo back-end.
2. Usar a conversão em `fetchPackages()`.
3. Considerar `[]` uma resposta válida.
4. Não carregar mocks apenas porque o banco está vazio.
5. Tratar separadamente:
   - carregamento;
   - lista vazia;
   - erro de comunicação.

### Arquivos envolvidos

- `src/app/lib/api.ts`
- `src/app/lib/adapters.ts`
- `src/app/context/AppContext.tsx`
- `backend/src/services/encomendas.services.js`
- `backend/src/controllers/encomendaController.js`

### Critérios de aceite

- Banco vazio produz uma lista vazia na interface.
- Dados inseridos diretamente no banco aparecem corretamente após atualizar a página.
- Nome, RA, código, data e status são apresentados corretamente.
- Aluno não recebe encomendas de outro usuário.

---

## Etapa 5 — Corrigir o cadastro de encomendas

### Objetivo

Substituir o cadastro local por uma inserção real no MySQL.

### Tarefas no front-end

1. Substituir o adaptador que envia IDs vazios pelo contrato definido na Etapa 2.
2. Tornar `handleSubmit()` assíncrono.
3. Usar `await addPackage(newPkg)`.
4. Exibir sucesso somente após HTTP `201`.
5. Manter os campos preenchidos quando ocorrer erro.
6. Desabilitar o botão durante o envio para evitar cadastros duplicados.

### Tarefas no back-end

1. Validar campos obrigatórios.
2. Localizar usuário pelo RA.
3. Recusar usuário inexistente ou inativo.
4. Localizar o status pelo código estável.
5. Obter o funcionário pelo JWT.
6. Criar `encomenda` e `historico_status` na mesma transação.
7. Retornar a encomenda no formato acordado.
8. Retornar códigos adequados:
   - `201` para criação;
   - `400` para payload inválido;
   - `404` para aluno/status inexistente;
   - `409` para duplicidade, se aplicável.

### Arquivos envolvidos

- `src/app/pages/staff/StaffCadastrar.tsx`
- `src/app/context/AppContext.tsx`
- `src/app/lib/api.ts`
- `src/app/lib/adapters.ts`
- `backend/src/controllers/encomendaController.js`
- `backend/src/services/encomendas.services.js`

### Critérios de aceite

- Uma linha é criada em `encomenda`.
- Uma linha correspondente é criada em `historico_status`.
- A encomenda continua visível depois de atualizar a página.
- Desligar a API causa mensagem de erro e não gera cadastro local.

---

## Etapa 6 — Corrigir status e retirada

### Objetivo

Persistir mudanças de status e dados de retirada.

### Tarefas

1. Definir os status válidos e suas transições.
2. Enviar código ou ID real do status, nunca o texto apenas visual.
3. Verificar se encomenda e status existem antes da atualização.
4. Atualizar status e histórico na mesma transação.
5. Definir os dados obrigatórios para retirada.
6. Persistir `data_entrega`.
7. Se nome e RA do retirante forem necessários, ajustar o schema ou utilizar corretamente a estrutura de autorização.
8. Atualizar o estado do front somente com a resposta da API.
9. Exibir sucesso somente após a confirmação do back-end.

### Arquivos envolvidos

- `src/app/pages/staff/StaffDashboard.tsx`
- `src/app/context/AppContext.tsx`
- `src/app/lib/api.ts`
- `backend/src/controllers/encomendaController.js`
- `backend/src/services/encomendas.services.js`
- `backend/prisma/schema.prisma`, se forem necessários novos campos

### Critérios de aceite

- O novo status permanece depois de atualizar a página.
- Cada alteração cria um histórico.
- A retirada preenche `data_entrega`.
- Transições inválidas são rejeitadas sem alterar a interface.

---

## Etapa 7 — Alinhar exclusão e permissões

### Objetivo

Garantir que as ações exibidas correspondam às permissões do back-end.

### Tarefas

1. Preservar `cargo` no usuário do front-end.
2. Mostrar exclusão apenas para administrador e supervisor.
3. Manter a autorização definitiva no back-end.
4. Aguardar a resposta da API antes de remover o item da tela.
5. Tratar `403` e `404` com mensagens diferentes.

### Critérios de aceite

- Funcionário sem cargo permitido não vê ou não consegue executar a ação.
- Administrador/supervisor consegue excluir.
- A lista só é alterada depois da resposta bem-sucedida.

---

## Etapa 8 — Remover comportamentos que mascaram falhas

### Objetivo

Garantir que a interface represente o estado verdadeiro do banco.

### Tarefas

1. Remover fallbacks automáticos para `mockPackages` e `registerUser()` no modo integrado.
2. Não adicionar encomenda ao estado quando `POST /encomendas` falhar.
3. Não atualizar status localmente quando o `PATCH` falhar.
4. Não excluir localmente quando o `DELETE` falhar.
5. Reservar `localStorage` somente para preferências e sessão, se desejado.
6. Caso os mocks sejam mantidos, condicioná-los a `VITE_USE_MOCKS=true`.
7. Criar estados visuais de carregamento, vazio e erro.

### Critérios de aceite

- Com o back-end desligado, nenhuma operação informa sucesso.
- Recarregar a página sempre reproduz o estado do banco.
- Dados de demonstração só aparecem quando o modo mock estiver explicitamente ativado.

---

## Etapa 9 — Corrigir nomes alternativos

### Objetivo

Alinhar o serviço ao modelo Prisma.

### Tarefas

1. Trocar `nome` por `nome_completo`.
2. Trocar `tipo` por `parentesco`.
3. Tratar `documento` e `ativo` conforme a regra definida.
4. Associar o registro ao usuário autenticado.
5. Verificar propriedade antes de excluir.
6. Criar chamadas correspondentes no front-end somente se essa funcionalidade fizer parte da entrega principal.

### Arquivos envolvidos

- `backend/src/services/nomeEntrega.service.js`
- `backend/src/controllers/nomeEntregaController.js`
- `backend/src/routes/nomeEntregaRoutes.js`
- `backend/prisma/schema.prisma`

### Critérios de aceite

- Criar, listar e remover nomes alternativos funciona com o schema atual.
- Um aluno não consegue remover registro de outro aluno.

---

## Etapa 10 — Validação final integrada

Executar os cenários abaixo sem limpar o `localStorage` entre cada ação. Depois, repetir com o `localStorage` vazio para provar que o banco é a fonte dos dados.

### Checklist

- [ ] A API correta responde na porta configurada.
- [ ] Migrations e seed executam sem erro.
- [ ] Aluno é cadastrado e aparece na tabela `usuario`.
- [ ] Aluno realiza login real.
- [ ] Funcionário realiza login real e mantém o cargo.
- [ ] Funcionário cadastra encomenda para um RA existente.
- [ ] A criação também gera `historico_status`.
- [ ] A encomenda permanece após recarregar a página.
- [ ] O aluno destinatário visualiza a encomenda.
- [ ] Outro aluno não visualiza a encomenda.
- [ ] Funcionário altera o status e a mudança permanece.
- [ ] Retirada preenche os dados definidos no banco.
- [ ] Usuário autorizado exclui uma encomenda.
- [ ] Usuário sem permissão recebe `403`.
- [ ] Banco vazio aparece como lista vazia, sem mocks.
- [ ] API desligada produz erro visível, sem sucesso simulado.
- [ ] Logout remove sessão e token.

## Divisão sugerida em entregas

### Entrega 1 — Base funcional

- ambiente, migrations e seed;
- contrato de login;
- login real de aluno e funcionário;
- listagem real de encomendas.

### Entrega 2 — Fluxo principal

- cadastro real de encomenda;
- conversão das respostas;
- atualização de status;
- histórico persistido.

### Entrega 3 — Finalização

- retirada;
- exclusão e permissões;
- remoção dos fallbacks;
- nomes alternativos, se estiverem no escopo final;
- execução completa do checklist.

## Definição de pronto

Uma tarefa deste plano somente deve ser marcada como concluída quando:

1. a chamada HTTP puder ser observada no navegador;
2. a API retornar o código esperado;
3. a alteração puder ser confirmada diretamente no banco;
4. a interface exibir o resultado retornado pela API;
5. o resultado continuar correto após recarregar a página;
6. o cenário de erro não produzir sucesso falso nem salvar dados apenas localmente.

