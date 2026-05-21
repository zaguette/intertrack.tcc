import * as nomeEntregaService from '../services/nomeEntrega.service.js';

export const criarNomeEntrega = async (req, res) => {
  try {
    const resultado = await nomeEntregaService.criar(req.body);
    res.status(201).json(resultado);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};