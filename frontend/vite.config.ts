import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, ".", "VITE_");
  if (command === "build" && mode === "production") {
    let api: URL;
    try { api = new URL(env.VITE_API_URL); }
    catch { throw new Error("Configure VITE_API_URL em .env.production com a URL HTTPS real da API."); }
    if (api.protocol !== "https:" || ["localhost", "127.0.0.1", "[::1]"].includes(api.hostname) || api.username || api.password || api.search || api.hash) {
      throw new Error("VITE_API_URL de produção deve ser HTTPS, pública e sem credenciais, query ou fragmento.");
    }
  }
  return {
    plugins: [react()],
    base: "/tecti/2026/gpec11/",
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});
