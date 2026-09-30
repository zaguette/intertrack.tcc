# Revisao Geral do Projeto Intertrack

**Data:** 30/09/2026  
**Escopo:** frontend React/Vite, backend Express, Prisma, MySQL/MariaDB e integracao entre camadas.

Este documento consolida o estado atual do projeto. Ele complementa os relatorios anteriores, que ainda possuem alguns apontamentos historicos ja corrigidos.

## 1. Resumo executivo

O projeto possui um MVP funcional de correio interno, com frontend separado do backend, autenticacao JWT, banco Prisma/MySQL, cadastro e consulta de encomendas, notificacoes e historico de status.

A integracao principal frontend/backend esta implementada e o frontend compila. Durante esta revisao foi encontrado e corrigido um erro critico de sintaxe em `backend/src/controllers/userController.js`: havia um comando de terminal inserido no final do arquivo, impedindo a inicializacao do backend.

O sistema ainda precisa de uma rodada de endurecimento antes de ser considerado pronto para producao: testes automatizados, validacoes de entrada, seguranca de respostas, baseline/migrations do banco e limpeza de componentes legados.

## 2. O que ja foi feito

### Frontend e integracao

- Login de aluno usando contrato `ra + senha`.
- Login de funcionario usando e-mail no mesmo campo de identificador.
- Token salvo no localStorage e enviado como `Authorization: Bearer TOKEN`.
- Logout removendo token, sessao, encomendas e notificacoes do estado.
- Cadastro de usuario feito pela API, sem fallback automatico para usuario mockado no fluxo principal.
- Cadastro, listagem, alteracao de status e exclusao de encomendas usando a API.
- Adaptador de resposta da API para o modelo usado pelas telas.
- Conversoes implementadas:
  - `codigo_rastreio` para `codigo`;
  - `destinatario.nome` para `aluno`;
  - `destinatario.ra` para `ra`;
  - `created_at` para `dataChegada`/`createdAt`;
  - `statusAtual` para `status`;
  - `data_entrega` para `dataRetirada`;
  - `retirado_por` para os campos de retirada.
- Mapeamento centralizado de status textual para `status_atual_id` em `frontend/src/app/lib/adapters.ts`.
- Notificacoes reais consultadas em `GET /encomendas/notificacoes`, com polling de 3 segundos.
- Notificacao ja visualizada nao volta a aparecer no mesmo navegador e usuario.
- Historico retornado pela API e exibido na tela do aluno.
- Perfil consultado por `GET /usuarios/perfil` e atualizado pela API.
- RA do perfil enviado ao backend durante a atualizacao.
- Cadastro inicial de encomenda limitado ao status Disponivel; retirada ocorre em fluxo separado.
- Erros de status de encomenda nao exibem mais a excecao Prisma inteira ao usuario.

### Backend e banco

- Express com rotas separadas para usuarios, encomendas e nomes de entrega.
- Cadastro com hash de senha usando bcrypt.
- Login com JWT e diferenciacao entre aluno e funcionario.
- `tipo` e `cargo` do funcionario incluidos no retorno e no token quando aplicavel.
- Middleware de autenticacao Bearer.
- Autorizacao por tipo de usuario e cargo.
- Cadastro de encomenda em transacao Prisma.
- Criacao do historico inicial na mesma transacao da encomenda.
- Criacao da notificacao na mesma transacao da encomenda.
- Listagem de encomendas filtrada para o aluno autenticado.
- RA do destinatario incluido na listagem de encomendas.
- Atualizacao de status com historico, `data_entrega` e `retirado_por`.
- Exclusao protegida por cargo.
- Migration e schema com `retirado_por`.
- Prisma Client regenerado a partir do schema atual.
- Servico de nomes alternativos alinhado aos campos do schema e com verificacao de propriedade.

## 3. Validacoes executadas

Foram executados com sucesso:

- `node --check` nos controllers e service backend alterados;
- `npm run build` no frontend;
- `npx prisma validate` no backend;
- `npx prisma generate` no backend;
- `git diff --check`.

O build do frontend emite apenas um aviso de bundle maior que 500 kB. Isso nao impede a execucao, mas recomenda code splitting em uma etapa futura.

Nao ha atualmente uma suite de testes automatizados cobrindo os fluxos de negocio.

## 4. Pendencias e riscos atuais

### Alta prioridade

#### 4.1 Testes automatizados inexistentes

O backend ainda possui um script de teste que termina com erro e nao ha cobertura automatizada no frontend. Isso deixa sem protecao os fluxos de login, autorizacao, cadastro, retirada, notificacoes e exclusao.

**Recomendacao:** criar testes para:

- login com RA, e-mail, senha incorreta e usuario desativado;
- protecao de rotas sem token e com token expirado;
- isolamento de encomendas entre alunos;
- cadastro e retirada em transacao;
- permissao de exclusao por cargo;
- perfil e atualizacao de RA;
- notificacao criada junto com nova encomenda.

#### 4.2 Erros internos ainda podem ser expostos em outras rotas

A rota de atualizacao de status ja foi protegida, mas outras rotas ainda retornam `error.message` diretamente, especialmente em controllers de encomendas e nomes alternativos.

**Risco:** mensagens do Prisma, nomes de tabelas e detalhes internos podem chegar ao navegador.

**Recomendacao:** usar respostas publicas curtas e registrar o erro somente no servidor.

#### 4.3 Seguranca de producao incompleta

- `cors()` esta aberto para qualquer origem.
- Nao existe validacao de `JWT_SECRET` na inicializacao.
- Nao ha rate limiting para login.
- Nao ha headers de seguranca ou politica explicita de ambiente.

**Recomendacao:** restringir CORS ao dominio do frontend, validar variaveis obrigatorias e adicionar protecoes antes do deploy publico.

#### 4.4 Exposicao potencial de dados sensiveis

`buscarEncomendaPorId()` inclui o destinatario inteiro. Isso pode incluir campos que nao deveriam ser devolvidos, como hash de senha.

**Recomendacao:** usar `select` explicito com apenas `id`, `nome`, `ra` e `email` quando necessario.

### Media prioridade

#### 4.5 Leitura de notificacao e apenas local

O frontend grava notificacoes lidas no localStorage. O campo `Notificacao.lida` do banco nao e atualizado e nao existe endpoint para marcar leitura.

**Impacto:** a notificacao pode reaparecer em outro navegador ou dispositivo.

**Recomendacao:** criar `PATCH /encomendas/notificacoes/:id/lida` ou documentar formalmente que a leitura e por dispositivo.

#### 4.6 RA de quem retirou nao e persistido

A tela coleta o nome e o RA de quem retirou, mas o contrato atual envia e salva apenas `retirado_por` como texto.

**Recomendacao:** decidir entre remover o campo RA da tela ou adicionar uma coluna/relacao propria para persistir esse dado.

#### 4.7 Validacoes de entrada incompletas

Cadastro e atualizacao de usuario precisam validar de forma consistente nome, e-mail, senha, RA, tamanho dos campos e conflitos de e-mail/RA. A atualizacao de usuario pode produzir erro generico em caso de duplicidade.

A atualizacao de status tambem deve validar existencia do status, existencia da encomenda e transicoes permitidas.

#### 4.8 Sessao local nao e revalidada ao restaurar

O frontend restaura o usuario do localStorage antes de consultar `/usuarios/perfil`. Uma sessao expirada pode aparecer visualmente autenticada ate uma chamada protegida falhar.

**Recomendacao:** validar a sessao no carregamento inicial e limpar token/sessao ao receber `401`.

#### 4.9 Componentes legados continuam no repositorio

`frontend/src/app/components/RegisterForm.tsx`, `StaffView.tsx`, `data/mockData.ts` e funcoes antigas de storage ainda existem, embora nao estejam conectados ao roteamento atual.

**Risco:** uma futura alteracao pode reativar fluxo local e quebrar a fonte oficial de dados.

**Recomendacao:** remover os componentes mortos ou move-los para uma pasta explicitamente marcada como demo, com uso controlado por configuracao.

#### 4.10 Configuracao de banco duplicada

A aplicacao e o Prisma usam fontes diferentes de configuracao: o runtime usa variaveis separadas e `prisma.config.ts` usa `DATABASE_URL`.

**Risco:** comandos Prisma e aplicacao podem apontar para bancos diferentes.

**Recomendacao:** escolher uma fonte oficial e documentar o comportamento de desenvolvimento, teste e producao.

#### 4.11 Migrations e baseline

O banco local existente ja apresentou incompatibilidade de historico Prisma (`P3005`) em verificacoes anteriores. A migration de `retirado_por` foi aplicada manualmente nesse contexto.

**Recomendacao:** definir um baseline oficial para banco legado e testar `prisma migrate deploy` em um banco limpo antes do deploy.

### Baixa prioridade

#### 4.12 Cargo exibido de forma fixa

A sidebar do funcionario ainda exibe “Administrador” mesmo quando o cargo real pode ser supervisor, porteiro ou recebimento.

#### 4.13 Bundle frontend grande

O Vite informa bundle maior que 500 kB. Nao e erro funcional, mas code splitting pode melhorar carregamento em celulares.

#### 4.14 README raiz incompleto

O README principal ainda nao documenta instalacao, variaveis de ambiente, banco, comandos de execucao, arquitetura e deploy.

## 5. Ordem recomendada de trabalho

1. Manter o backend iniciado a partir de `backend` e confirmar `npx prisma generate` apos qualquer alteracao no schema.
2. Adicionar testes de API para autenticacao, autorizacao e encomendas.
3. Remover exposicao de `error.message` e dados sensiveis das respostas.
4. Validar `JWT_SECRET`, configuracao do banco e restringir CORS.
5. Definir leitura persistida de notificacoes entre dispositivos.
6. Resolver o contrato do RA de quem retira.
7. Revalidar sessao ao carregar o frontend.
8. Corrigir seed, baseline e fluxo de migrations em banco limpo.
9. Remover componentes legados/mockados sem uso.
10. Completar README e preparar deploy.

## 6. Como executar localmente

### Backend

```powershell
cd backend
npm install
npx prisma generate
npm run dev
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Para acessar pelo celular na mesma rede, iniciar o Vite com:

```powershell
npm run dev -- --host 0.0.0.0
```

Depois acessar no celular o IP do computador na porta informada pelo Vite. O backend tambem precisa estar ativo e acessivel pelo proxy configurado.

## 7. Conclusao

O projeto ja possui uma base funcional e a integracao principal esta implementada. As correcoes recentes resolveram os contratos centrais de login, encomendas, retirada, perfil, notificacoes e historico.

O maior risco atual nao e mais a ausencia da integracao, mas a falta de testes, endurecimento de seguranca, consistencia de migrations e existencia de codigo legado que pode reintroduzir persistencia local. A recomendacao e tratar os itens de alta prioridade antes de publicar ou apresentar o sistema como pronto para producao.
