import {
  criarEncomenda,
  listarEncomendas,
  listarNotificacoes,
  buscarEncomendaPorId,
  atualizarStatusEncomenda,
  deletarEncomenda
} from '../services/encomendas.services.js';

export const encomendaController = {

  async create(req, res) {
    try {
      const funcionario_id = req.user.id;

      const resultado = await criarEncomenda(req.body, funcionario_id);

      res.status(201).json(resultado);

    } catch (error) {
      console.error("ERRO AO CRIAR ENCOMENDA:", error);
      res.status(500).json({ erro: "Não foi possível cadastrar a encomenda." });
    }
  },

  async list(req, res) {
    try {
      const { busca } = req.query;

      const encomendas = await listarEncomendas(
        busca,
        req.user.id,
        req.user.tipo
      );

      res.json(encomendas);

    } catch (error) {
      console.error("ERRO AO LISTAR ENCOMENDAS:", error);
      res.status(500).json({ erro: error.message });
    }
  },

  async listNotifications(req, res) {
    try {
      const notificacoes = await listarNotificacoes(req.user.id);
      res.json(notificacoes);
    } catch (error) {
      res.status(500).json({ erro: error.message });
    }
  },

  async getById(req, res) {
    try {

      const { id } = req.params;

      const encomenda = await buscarEncomendaPorId(id);

      if (!encomenda) {
        return res.status(404).json({
          erro: 'Encomenda não encontrada'
        });
      }

      // Aluno só pode ver a própria encomenda (a de quem é o destinatário).
      // Funcionário pode ver qualquer uma.
      if (
        req.user.tipo === "aluno" &&
        encomenda.destinatario_usuario_id !== req.user.id
      ) {
        return res.status(403).json({
          erro: 'Você não tem permissão para ver esta encomenda.'
        });
      }

      res.json(encomenda);

    } catch (error) {
      res.status(500).json({ erro: error.message });
    }
  },

  async updateStatus(req, res) {
    try {

      const { id } = req.params;

      const funcionario_id = req.user.id;

      const { status_atual_id, retirado_por } = req.body;

      const encomenda = await atualizarStatusEncomenda(
        id,
        status_atual_id,
        funcionario_id,
        retirado_por
      );

      res.json(encomenda);

    } catch (error) {
      console.error("ERRO AO ATUALIZAR STATUS:", error);
      res.status(500).json({ erro: "Não foi possível atualizar o status da encomenda." });
    }
  },

  async delete(req, res) {
    try {

      const { id } = req.params;

      await deletarEncomenda(id);

      res.json({
        mensagem: 'Encomenda deletada com sucesso'
      });

    } catch (error) {
      res.status(500).json({ erro: error.message });
    }
  }
};