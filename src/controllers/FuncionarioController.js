const { Funcionario } = require('../models');

module.exports = {
  async index(req, res) {
    try {
      
      const funcionarios = await Funcionario.findAll();
      res.json(funcionarios);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao listar funcionários' });
    }
  },

  async create(req, res) {
    try {
      const { nome, cargo, departamento, pix } = req.body;
      const funcionario = await Funcionario.create({ nome, cargo, departamento, pix });
      res.status(201).json(funcionario);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: 'Erro ao cadastrar funcionário' });
    }
  },

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, cargo, departamento, pix } = req.body;
      const funcionario = await Funcionario.findByPk(id);

      if (!funcionario) {
        return res.status(404).json({ error: 'Funcionário não encontrado' });
      }

      await funcionario.update({ nome, cargo, departamento, pix });
      res.json(funcionario);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: 'Erro ao atualizar funcionário' });
    }
  },

  async deletar(req, res) {
    try {
      const { id } = req.params;
      const funcionario = await Funcionario.findByPk(id);

      if (!funcionario) {
        return res.status(404).json({ error: 'Funcionário não encontrado' });
      }

      await funcionario.destroy();
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: 'Erro ao excluir funcionário' });
    }
  }
};
