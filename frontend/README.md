# UNASP Correio Interno — frontend

React 18, TypeScript, Vite, Tailwind CSS e React Router 7.
A autenticação usa a API Express com JWT; não há integração LDAP implementada.

Consulte [Deploy no README principal](../README.md#deploy) para configurar a API,
gerar a build e publicar em `/tecti/2026/gpec11/`.

Desenvolvimento: `npm install` e `npm run dev`. O backend deve estar na porta 3000.
Build: configure `.env.production` a partir de `.env.example` e execute `npm run build`.
Preview: `npm run preview`.
