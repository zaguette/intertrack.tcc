import "dotenv/config";

export function corsOptions() {
  const frontend = process.env.FRONTEND_URL || (process.env.NODE_ENV === "production" ? "" : "http://localhost:5173");
  let url;
  try { url = new URL(frontend); }
  catch { throw new Error("FRONTEND_URL deve informar a URL do frontend."); }
  if (!["http:", "https:"].includes(url.protocol) || (process.env.NODE_ENV === "production" && url.protocol !== "https:")) {
    throw new Error("FRONTEND_URL de produção deve usar HTTPS.");
  }
  // Origin HTTP não contém o caminho da subpasta.
  return {
    origin(origin, callback) {
      if (!origin || origin === url.origin) return callback(null, true);
      const error = new Error("Origem não permitida.");
      error.status = 403;
      callback(error);
    },
  };
}
