import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'chave_mestra_unasp_2024';

export const verificarToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) return res.status(403).json({ erro: "Token não fornecido." });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ erro: "Token inválido." });
        req.user = decoded; // Salva os dados do usuário na requisição
        next();
    });
};