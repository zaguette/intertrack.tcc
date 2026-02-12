# UNASP Correio Interno

Sistema de gerenciamento de encomendas para o internato do UNASP, com fluxo de cadastro pelo funcionário e consulta pelo aluno.

## 🚀 Funcionalidades
- Login integrado com credenciais do sistema de internet do internato
- Seleção de perfil (aluno/funcionário)
- Cadastro e gerenciamento de encomendas
- Dashboard com estatísticas em tempo real
- Visualização filtrada por aluno
- Notificações do navegador quando encomenda fica disponível
- Toast notifications para feedback de ações
- Persistência em localStorage (desenvolvimento)

## 🔐 Autenticação

### Ambiente de Desenvolvimento
Credenciais de teste:
- **Aluno**: usuário `aluno` / senha `123456`
- **Funcionário**: usuário `admin` / senha `admin123`

### Ambiente de Produção
O sistema deve ser integrado com o LDAP/Active Directory do UNASP para usar as **mesmas credenciais do sistema de internet do internato**. Cada aluno/funcionário fará login com seu usuário e senha institucional.

## 📋 Requisitos para produção

### Integração de Autenticação
- **LDAP/Active Directory**: Integração com o servidor de autenticação do UNASP
- **Credenciais de Serviço**: Conta de serviço para consultas LDAP
- **Mapeamento de Perfis**: Distinguir automaticamente entre alunos e funcionários via grupos do AD

### Infraestrutura
- Certificado SSL/TLS válido
- Domínio institucional (ex: correio.unasp.edu.br)
- Servidor backend para API de autenticação LDAP
- Banco de dados (substituir localStorage)

### Segurança e Compliance
- Conformidade com LGPD
- Logs de auditoria de acessos e ações
- Política de retenção de dados
- Criptografia de dados sensíveis

## Testes recomendados
- Integração com sistema do campus.
- Fluxo completo de autenticação.
- Verificação de permissões (aluno vs funcionário).
