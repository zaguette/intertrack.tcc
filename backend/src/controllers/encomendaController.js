import {
  criarEncomenda,
  listarEncomendas,
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
      res.status(500).json({ erro: error.message });
    }
  },

  async list(req, res) {
    try {
      const { busca } = req.query;

      const encomendas = await listarEncomendas(busca);

      res.json(encomendas);

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

      res.json(encomenda);

    } catch (error) {
      res.status(500).json({ erro: error.message });
    }
  },

  async updateStatus(req, res) {
    try {

      const { id } = req.params;

      const funcionario_id = req.user.id;

      const { status_atual_id } = req.body;

      const encomenda = await atualizarStatusEncomenda(
        id,
        status_atual_id,
        funcionario_id
      );

      res.json(encomenda);

    } catch (error) {
      res.status(500).json({ erro: error.message });
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