import { criarEncomenda, listarEncomendas } from '../services/encomendas.services.js';

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
  }
};