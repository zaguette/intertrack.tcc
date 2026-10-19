import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client.js";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL é obrigatória.");
let url;
try { url = new URL(process.env.DATABASE_URL); }
catch { throw new Error("DATABASE_URL inválida."); }
if (url.protocol !== "mysql:" || !url.hostname || !url.pathname.slice(1)) {
  throw new Error("DATABASE_URL deve usar mysql:// e informar host e banco.");
}
if (process.env.DATABASE_SSL && !["true", "false"].includes(process.env.DATABASE_SSL)) {
  throw new Error("DATABASE_SSL deve ser true ou false.");
}
const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: Number(url.port || 3306),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: decodeURIComponent(url.pathname.slice(1)),
  connectionLimit: 5,
  connectTimeout: 10000,
  ...(process.env.DATABASE_SSL === "true" ? {
    ssl: {
      rejectUnauthorized: true,
      ...(process.env.DATABASE_SSL_CA ? { ca: process.env.DATABASE_SSL_CA.replace(/\\n/g, "\n") } : {}),
    },
  } : {}),
});
const prisma = new PrismaClient({ adapter });
export { prisma };
