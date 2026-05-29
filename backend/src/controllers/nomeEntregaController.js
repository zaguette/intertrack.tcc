import {
  criarNomeAlternativo,
  listarNomesAlternativos,
  deletarNomeAlternativo
} from '../services/nomeEntrega.services.js';

export const nomeEntregaController = {

  async create(req, res) {

    try {

      const usuario_id = req.user.id;

      const resultado =
        await criarNomeAlternativo(
          req.body,
          usuario_id
        );

      res.status(201).json(resultado);

    } catch (error) {

      res.status(500).json({
        erro: error.message
      });
    }
  },

  async list(req, res) {

    try {

      const usuario_id = req.user.id;

      const nomes =
        await listarNomesAlternativos(
          usuario_id
        );

      res.json(nomes);

    } catch (error) {

      res.status(500).json({
        erro: error.message
      });
    }
  },

  async delete(req, res) {

    try {

      const { id } = req.params;

      await deletarNomeAlternativo(id);

      res.json({
        mensagem:
          'Nome alternativo removido com sucesso'
      });

    } catch (error) {

      res.status(500).json({
        erro: error.message
      });
    }
  }
};