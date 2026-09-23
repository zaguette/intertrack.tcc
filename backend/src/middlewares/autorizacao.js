// src/middlewares/autorizacao.js
//
// Deve ser usado SEMPRE depois do verificarToken, pois depende de req.user
// já ter sido preenchido com os dados do token (id, tipo, e cargo quando
// for funcionário).

// Libera a rota apenas para alunos (tipo: "aluno")
export const apenasAluno = (req, res, next) => {
    if (req.user?.tipo !== "aluno") {
        return res.status(403).json({
            erro: "Acesso permitido apenas para alunos."
        });
    }
    next();
};

// Libera a rota apenas para funcionários (tipo: "funcionario")
export const apenasFuncionario = (req, res, next) => {
    if (req.user?.tipo !== "funcionario") {
        return res.status(403).json({
            erro: "Acesso permitido apenas para funcionários."
        });
    }
    next();
};

// Libera a rota apenas para funcionários com um dos cargos informados.
// Uso: apenasCargos("administrador", "supervisor")
export const apenasCargos = (...cargosPermitidos) => {
    return (req, res, next) => {
        if (req.user?.tipo !== "funcionario") {
            return res.status(403).json({
                erro: "Acesso permitido apenas para funcionários."
            });
        }

        if (!cargosPermitidos.includes(req.user.cargo)) {
            return res.status(403).json({
                erro: "Seu cargo não tem permissão para esta ação."
            });
        }

        next();
    };
};

// Libera a rota se:
// - o usuário autenticado é o próprio dono do recurso (aluno acessando /usuarios/:id dele mesmo)
// - OU é um funcionário (qualquer cargo, por enquanto)
//
// Usado em rotas como GET/PUT /usuarios/:id
export const verificarDonoOuFuncionario = (req, res, next) => {
    const { id } = req.params;

    if (req.user?.tipo === "funcionario") {
        return next();
    }

    if (req.user?.tipo === "aluno" && req.user.id === id) {
        return next();
    }

    return res.status(403).json({
        erro: "Você não tem permissão para acessar este recurso."
    });
};