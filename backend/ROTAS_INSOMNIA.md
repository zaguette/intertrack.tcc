# Intertrack API — Guia de rotas para o Insomnia

Este documento lista todas as rotas explícitas disponíveis no backend e mostra como configurá-las no Insomnia.

## Configuração inicial

Crie um ambiente no Insomnia com as seguintes variáveis:

```json
{
  "base_url": "http://localhost:3000",
  "token": ""
}
```

Use `{{ _.base_url }}` como início das URLs. Depois de fazer login, copie o valor de `token` retornado pela API e coloque-o na variável `token` do ambiente.

Nas rotas privadas, abra a aba **Auth**, selecione **Bearer Token** e informe:

```text
{{ _.token }}
```

Para requisições com corpo JSON, utilize o cabeçalho:

```http
Content-Type: application/json
```

> O prefixo `/api` usado pelo frontend não faz parte das rotas do backend. Ele é removido pelo proxy do Vite. No Insomnia, acesse diretamente `http://localhost:3000/usuarios`, `http://localhost:3000/encomendas` etc.

## Resumo

| Acesso | Quantidade |
|---|---:|
| Públicas | 3 |
| Privadas por JWT | 13 |
| Total | 16 |

Uma rota marcada como privada exige apenas um JWT válido. Atualmente o backend não restringe essas rotas por perfil (`aluno` ou `funcionario`) nem por cargo do funcionário.

## Rotas públicas

### Verificar a API

```http
GET {{ _.base_url }}/
```

Não exige autenticação.

Resposta esperada:

```json
{
  "mensagem": "Intertrack API online! 🚀"
}
```

### Cadastrar usuário

```http
POST {{ _.base_url }}/usuarios/register
```

Não exige autenticação.

Body JSON implementado pelo controller:

```json
{
  "nome": "João da Silva",
  "email": "joao@exemplo.com",
  "senha": "senha-segura",
  "telefone": "11999999999"
}
```

Resposta de sucesso prevista: `201 Created`.

> Atenção: o schema atual exige o campo `ra`, mas o controller não o recebe nem o salva. Por isso, esta rota pode retornar `400` até que a implementação seja corrigida.

### Login

```http
POST {{ _.base_url }}/usuarios/login
```

Não exige autenticação.

Body JSON:

```json
{
  "email": "joao@exemplo.com",
  "senha": "senha-segura"
}
```

Resposta de sucesso para aluno:

```json
{
  "auth": true,
  "token": "JWT_GERADO_PELA_API",
  "user": {
    "id": "UUID_DO_USUARIO",
    "nome": "João da Silva",
    "email": "joao@exemplo.com",
    "tipo": "aluno"
  }
}
```

Resposta de sucesso para funcionário:

```json
{
  "auth": true,
  "token": "JWT_GERADO_PELA_API",
  "user": {
    "id": "UUID_DO_FUNCIONARIO",
    "nome": "Maria Souza",
    "email": "maria@exemplo.com",
    "tipo": "funcionario",
    "cargo": "recebimento"
  }
}
```

O token expira em oito horas.

## Rotas privadas de usuários

### Consultar o perfil autenticado

```http
GET {{ _.base_url }}/usuarios/perfil
Authorization: Bearer {{ _.token }}
```

Retorna os dados armazenados no JWT, não um usuário atualizado diretamente do banco.

### Listar todos os usuários

```http
GET {{ _.base_url }}/usuarios
Authorization: Bearer {{ _.token }}
```

Retorna os usuários ordenados do cadastro mais recente para o mais antigo.

### Buscar usuário por ID

```http
GET {{ _.base_url }}/usuarios/UUID_DO_USUARIO
Authorization: Bearer {{ _.token }}
```

Substitua `UUID_DO_USUARIO` pelo campo `id` de um usuário.

### Atualizar usuário

```http
PUT {{ _.base_url }}/usuarios/UUID_DO_USUARIO
Authorization: Bearer {{ _.token }}
Content-Type: application/json
```

Body JSON:

```json
{
  "nome": "João da Silva Atualizado",
  "email": "joao.atualizado@exemplo.com",
  "telefone": "11988888888",
  "senha": "nova-senha"
}
```

O campo `senha` pode ser omitido para manter a senha atual. Como a atualização usa `PUT`, recomenda-se enviar também os demais campos atuais do usuário.

### Desativar usuário

```http
DELETE {{ _.base_url }}/usuarios/UUID_DO_USUARIO
Authorization: Bearer {{ _.token }}
```

A rota não apaga o registro: define `ativo` como `false`.

## Rotas privadas de encomendas

### Cadastrar encomenda

```http
POST {{ _.base_url }}/encomendas
Authorization: Bearer {{ _.token }}
Content-Type: application/json
```

Body JSON:

```json
{
  "codigo_rastreio": "BR123456789XX",
  "descricao": "Caixa pequena",
  "destinatario_usuario_id": "UUID_DO_USUARIO",
  "remetente_id": "UUID_DO_REMETENTE",
  "status_atual_id": "UUID_DO_STATUS",
  "observacoes": "Manusear com cuidado"
}
```

`remetente_id` pode ser omitido ou enviado como `null`. O backend utiliza o ID presente no token como `funcionario_id`.

Embora a rota aceite qualquer token, ela foi implementada como uma operação de funcionário. Um token de aluno tende a causar erro de relacionamento no banco.

### Listar encomendas

```http
GET {{ _.base_url }}/encomendas
Authorization: Bearer {{ _.token }}
```

Quando o token pertence a um aluno, são retornadas apenas as encomendas cujo destinatário é esse aluno. Para funcionário, o backend não aplica esse filtro.

### Pesquisar encomendas

```http
GET {{ _.base_url }}/encomendas?busca=BR123
Authorization: Bearer {{ _.token }}
```

O parâmetro opcional `busca` pesquisa pelo código de rastreio ou pelo nome do destinatário.

### Buscar encomenda por ID

```http
GET {{ _.base_url }}/encomendas/UUID_DA_ENCOMENDA
Authorization: Bearer {{ _.token }}
```

Substitua `UUID_DA_ENCOMENDA` pelo campo `id` de uma encomenda.

### Atualizar status da encomenda

```http
PATCH {{ _.base_url }}/encomendas/UUID_DA_ENCOMENDA/status
Authorization: Bearer {{ _.token }}
Content-Type: application/json
```

Body JSON:

```json
{
  "status_atual_id": "UUID_DO_NOVO_STATUS"
}
```

Além de alterar o status atual, a rota cria uma entrada no histórico usando o ID do token como funcionário responsável.

### Excluir encomenda

```http
DELETE {{ _.base_url }}/encomendas/UUID_DA_ENCOMENDA
Authorization: Bearer {{ _.token }}
```

Esta operação exclui o registro da encomenda.

## Rotas privadas de nomes alternativos

### Cadastrar nome alternativo

```http
POST {{ _.base_url }}/nomes-entrega
Authorization: Bearer {{ _.token }}
Content-Type: application/json
```

Body atualmente lido pelo serviço:

```json
{
  "nome": "José da Silva",
  "tipo": "pai"
}
```

> Atenção: esta rota está incompatível com o schema Prisma. O serviço envia `nome` e `tipo`, enquanto o modelo espera `nome_completo` e `parentesco`. A requisição pode retornar `500` até que o código seja corrigido.

### Listar nomes alternativos

```http
GET {{ _.base_url }}/nomes-entrega
Authorization: Bearer {{ _.token }}
```

Retorna apenas os nomes vinculados ao ID presente no token.

### Excluir nome alternativo

```http
DELETE {{ _.base_url }}/nomes-entrega/UUID_DO_NOME
Authorization: Bearer {{ _.token }}
```

Substitua `UUID_DO_NOME` pelo campo `id` do nome alternativo.

## Ordem sugerida de testes no Insomnia

1. `GET /` para confirmar que o servidor está online.
2. `POST /usuarios/login` com uma conta existente.
3. Salvar o JWT retornado na variável `token`.
4. `GET /usuarios/perfil` para validar a autenticação.
5. `GET /usuarios` para obter IDs de usuários.
6. `GET /encomendas` para obter IDs de encomendas, remetentes e status.
7. Testar criação, atualização e exclusão somente com dados descartáveis.

## Respostas comuns de autenticação

Sem cabeçalho `Authorization`:

```http
401 Unauthorized
```

```json
{
  "erro": "Token não informado."
}
```

Token fora do formato `Bearer <token>`:

```json
{
  "erro": "Token em formato inválido."
}
```

Token inválido ou expirado:

```json
{
  "erro": "Token inválido ou expirado."
}
```

## Observações de segurança

- Todas as rotas privadas validam somente o JWT; não há middleware de autorização por perfil ou cargo.
- Um aluno autenticado consegue chamar rotas administrativas de usuários e encomendas.
- `GET /encomendas/:id` não confirma se a encomenda pertence ao aluno autenticado.
- `DELETE /nomes-entrega/:id` não confirma se o nome pertence ao usuário autenticado.
- A consulta individual de encomenda inclui o objeto completo do destinatário e pode expor o hash da senha.
- Um token emitido continua válido até expirar, mesmo se o usuário for desativado posteriormente.
- O CORS está aberto para todas as origens.
- O arquivo `.env.example` deve passar a documentar a variável `JWT_SECRET`.

## Índice completo dos endpoints

| Método | Endpoint | Acesso |
|---|---|---|
| `GET` | `/` | Público |
| `POST` | `/usuarios/register` | Público |
| `POST` | `/usuarios/login` | Público |
| `GET` | `/usuarios/perfil` | JWT |
| `GET` | `/usuarios` | JWT |
| `GET` | `/usuarios/:id` | JWT |
| `PUT` | `/usuarios/:id` | JWT |
| `DELETE` | `/usuarios/:id` | JWT |
| `POST` | `/encomendas` | JWT |
| `GET` | `/encomendas` | JWT |
| `GET` | `/encomendas/:id` | JWT |
| `PATCH` | `/encomendas/:id/status` | JWT |
| `DELETE` | `/encomendas/:id` | JWT |
| `POST` | `/nomes-entrega` | JWT |
| `GET` | `/nomes-entrega` | JWT |
| `DELETE` | `/nomes-entrega/:id` | JWT |
