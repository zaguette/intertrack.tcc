# Relatório de Alterações do Backend

## Objetivo

Este documento descreve as alterações realizadas no backend do Intertrack, explicando como cada fluxo funcionava antes, como passou a funcionar e o motivo da mudança.

## 1. Retirada de encomendas

### Antes

A atualização de status recebia somente `status_atual_id`. O backend alterava o status da encomenda e criava o registro no histórico, mas não salvava o nome da pessoa que retirou a encomenda. A coluna `data_entrega` também não era preenchida pelo fluxo de baixa.

### Agora

O modelo `Encomenda` possui o campo opcional `retirado_por`. O endpoint `PATCH /encomendas/:id/status` aceita:

```json
{
  "status_atual_id": "id-do-status-entregue",
  "retirado_por": "Nome da pessoa que retirou"
}
```

Quando `retirado_por` é informado, o service grava automaticamente:

- `status_atual_id` com o status recebido;
- `retirado_por` com o nome informado;
- `data_entrega` com a data e hora atuais;
- um novo registro em `historico_status`.

Quando a encomenda volta para um status sem retirada, os campos de retirada são limpos.

### Por que mudou

A tela do aluno precisava exibir a data, o horário e o responsável pela retirada após o administrador confirmar a entrega. Sem persistir esses dados, as informações desapareciam após recarregar a página.

Arquivos relacionados:

- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/20260929143000_adiciona_retirado_por/migration.sql`
- `backend/src/controllers/encomendaController.js`
- `backend/src/services/encomendas.services.js`

## 2. Notificações de novas encomendas

### Antes

O cadastro criava somente a encomenda e o histórico de status. Apesar de o schema possuir o model `Notificacao`, nenhuma notificação era criada nem havia rota para consultá-la.

### Agora

O cadastro de uma encomenda cria, na mesma transação do banco, uma notificação vinculada ao aluno e à encomenda:

- tipo: `nova_encomenda`;
- mensagem informando que a encomenda está disponível;
- usuário destinatário definido pelo `destinatario_usuario_id`.

Também foi criada a rota autenticada:

```text
GET /encomendas/notificacoes
```

Essa rota retorna somente as notificações do usuário autenticado, ordenadas da mais recente para a mais antiga.

### Por que mudou

A notificação precisava ser criada junto com a encomenda para evitar que uma operação fosse concluída sem a outra. A transação garante consistência entre cadastro, histórico e notificação.

Arquivos relacionados:

- `backend/src/services/encomendas.services.js`
- `backend/src/controllers/encomendaController.js`
- `backend/src/routes/encomendaRoutes.js`

## 3. Ordenação das encomendas

### Antes

A consulta de encomendas não definia uma ordenação no Prisma. A ordem dependia do banco e podia variar entre requisições.

### Agora

A listagem usa:

```js
orderBy: { created_at: "desc" }
```

Assim, as encomendas mais recentes aparecem primeiro e as mais antigas ficam no final.

### Por que mudou

A lista precisava manter uma ordem cronológica determinística, especialmente após novos cadastros e atualizações automáticas.

Arquivo relacionado:

- `backend/src/services/encomendas.services.js`

## 4. Validação e retorno do RA do usuário

### Antes

O cadastro de usuário aceitava qualquer conteúdo no campo `ra`. Além disso, o login do aluno retornava o e-mail, mas não retornava explicitamente o RA. Algumas respostas de busca por usuário também não incluíam o RA.

### Agora

O cadastro rejeita RA que não siga o formato:

```text
^\d{6}$
```

O login de aluno retorna `ra` e `email` em campos separados. A busca de usuário por ID também retorna o RA.

### Por que mudou

O RA é o identificador acadêmico do aluno e deve ser separado do e-mail. A validação no backend impede que chamadas diretas à API contornem a validação da interface.

Arquivo relacionado:

- `backend/src/controllers/userController.js`

## 5. Nomes alternativos

### Antes

O service usava os campos `nome` e `tipo`, mas o schema Prisma define `nome_completo` e `parentesco`. Isso poderia causar erro ao criar um nome alternativo. A exclusão também aceitava somente o ID e não verificava se o registro pertencia ao usuário autenticado.

### Agora

O service:

- grava `nome_completo`;
- grava `parentesco`;
- aceita `documento` quando informado;
- exige um nome preenchido;
- verifica `usuario_id` antes da exclusão;
- retorna erro quando o registro não pertence ao usuário.

O controller passa o usuário autenticado para o service de exclusão.

### Por que mudou

A implementação precisava respeitar o schema real e impedir que um aluno removesse o nome alternativo de outra pessoa.

Arquivos relacionados:

- `backend/src/services/nomeEntrega.service.js`
- `backend/src/controllers/nomeEntregaController.js`

## 6. Migration e Prisma Client

### Antes

O banco existente não possuía a coluna `retirado_por`, e o Prisma Client não conhecia esse campo.

### Agora

Foi criada a migration:

```text
backend/prisma/migrations/20260929143000_adiciona_retirado_por/migration.sql
```

A migration adiciona a coluna de forma segura, verificando se ela já existe antes de executar o `ALTER TABLE`. O Prisma Client também foi regenerado após a alteração do schema.

### Por que mudou

O schema, o client Prisma e o banco precisam possuir o mesmo contrato para que a atualização de retirada funcione em runtime.

## 7. Validações realizadas

Foram executadas as seguintes validações:

- build do frontend com TypeScript e Vite;
- verificação de sintaxe dos controllers e services backend;
- `prisma validate`;
- regeneração do Prisma Client;
- execução da SQL da nova coluna no banco local.

O comando `prisma migrate deploy` encontrou um banco já existente sem histórico Prisma baseline e retornou `P3005`. Por isso, a SQL da nova migration foi executada diretamente no banco local. Em ambientes novos, a migration deve ser aplicada normalmente.

## 8. Observação sobre sincronização

O frontend consulta encomendas e notificações automaticamente a cada 3 segundos. O backend permanece como fonte oficial dos dados. Também foi adicionada proteção no estado do frontend para impedir que uma resposta HTTP antiga sobrescreva uma resposta mais recente.

A solução atual é polling, não WebSocket ou Server-Sent Events. Portanto, a atualização automática ocorre em poucos segundos, mas não é um canal realtime de conexão contínua.
