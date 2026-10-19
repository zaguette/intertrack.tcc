import "dotenv/config";
import express from "express";
import cors from "cors";
import { corsOptions } from "./config/http.js";
import { prisma } from "./config/prisma.js";
import userRoutes from "./routes/userRoutes.js";
import encomendaRoutes from "./routes/encomendaRoutes.js";
import nomeEntregaRoutes from "./routes/nomeEntregaRoutes.js";

const app = express();
const PORT = Number(process.env.PORT || 3000);
if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) throw new Error("PORT inválida.");
if (!process.env.JWT_SECRET || (process.env.NODE_ENV === "production" && process.env.JWT_SECRET.length < 32)) {
  throw new Error("Configure JWT_SECRET; em produção use um segredo aleatório com pelo menos 32 caracteres.");
}
app.disable("x-powered-by");
app.use(cors(corsOptions()));
app.use(express.json());
app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/usuarios", userRoutes);
app.use("/nomes-entrega", nomeEntregaRoutes);
app.use("/encomendas", encomendaRoutes);
app.get("/", (req, res) => res.json({ mensagem: "Intertrack API online! 🚀" }));
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = error.status >= 400 && error.status < 500 ? error.status : 500;
  res.status(status).json({ erro: status === 500 ? "Erro interno do servidor." : "Requisição inválida ou origem não permitida." });
});

let server;
try {
  await prisma.$connect();
  server = app.listen(PORT, "0.0.0.0", () => console.log(`Servidor ouvindo na porta ${PORT}`));
  server.on("error", () => { console.error("Falha ao iniciar servidor HTTP."); process.exit(1); });
} catch {
  console.error("Falha ao conectar ao banco. Verifique rede, credenciais e TLS.");
  process.exit(1);
}
let shuttingDown = false;
async function gracefulShutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  const timeout = setTimeout(() => process.exit(1), 10000);
  timeout.unref();
  try {
    if (server) await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    await prisma.$disconnect();
    clearTimeout(timeout);
    process.exit(0);
  } catch {
    console.error("Falha ao encerrar servidor.");
    process.exit(1);
  }
}
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
