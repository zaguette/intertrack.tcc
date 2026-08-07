import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const verificarToken = (req, res, next) => {
    const cabecalho = req.headers.authorization;

    if (!cabecalho) {
        return res.status(401).json({
            erro: "Token não informado."
        });
    }

    const [tipo, token] = cabecalho.split(" ");

    if (tipo !== "Bearer" || !token) {
        return res.status(401).json({
            erro: "Token em formato inválido."
        });
    }

    try {
        const dados = jwt.verify(token, JWT_SECRET);

        req.user = dados;

        next();
    } catch (erro) {
        return res.status(401).json({
            erro: "Token inválido ou expirado."
        });
    }
};