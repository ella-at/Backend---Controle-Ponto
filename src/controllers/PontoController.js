const { Ponto, Funcionario } = require('../models');
const { Sequelize, Op } = require('sequelize'); 
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

module.exports = {
  async registrar(req, res) {
    try {
      const { funcionario_id, tipo } = req.body;
      const foto = req.files['foto']?.[0]?.path || null;
      const assinatura = req.files['assinatura']?.[0]?.path || null;

      const ponto = await Ponto.create({
        funcionario_id,
        tipo,
        foto,
        assinatura,
        data_hora: new Date(),
      });

      res.status(201).json(ponto);
    } catch (error) {
      res.status(400).json({ error: 'Erro ao registrar ponto' });
    }
  },

  async listarHoje(req, res) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    try {
      const pontos = await Ponto.findAll({
        where: {
          data_hora: {
            [Op.gte]: hoje
          }
        },
        include: [{
          model: Funcionario,
          as: 'Funcionario' 
        }]
      });
      res.json(pontos);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar pontos de hoje' });
    }
  },

  async pontosPorData(req, res) {
    try {
      const data = req.query.data;
      if (!data) return res.status(400).json({ error: 'Data obrigatória' });

      const pontos = await Ponto.findAll({
        where: Sequelize.where(
          Sequelize.fn('DATE', Sequelize.col('data_hora')),
          data
        ),
        include: [{
          model: Funcionario,
          as: 'Funcionario' 
        }]
      });

      res.json(pontos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar pontos por data' });
    }
  },

  async faltantes(req, res) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    try {
      const funcionarios = await Funcionario.findAll();
      const registrosHoje = await Ponto.findAll({
        where: {
          tipo: 'entrada',
          data_hora: {
            [Op.gte]: hoje
          }
        }
      });

      const idsComEntrada = registrosHoje.map(r => r.funcionario_id);
      const faltando = funcionarios.filter(f => !idsComEntrada.includes(f.id));

      res.json(faltando);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar faltantes' });
    }
  },

  async porFuncionario(req, res) {
    try {
      const { id } = req.params;
  
      const pontos = await Ponto.findAll({
        where: { funcionario_id: id },
        order: [['data_hora', 'DESC']]
      });
  
      res.json(pontos);
    } catch (error) {
      console.error('Erro ao buscar pontos por funcionário:', error);
      res.status(500).json({ error: 'Erro ao buscar registros de ponto' });
    }
  },

  async registrar(req, res) {
    try {
      const { funcionario_id, tipo } = req.body;
      const foto = req.files['foto']?.[0]?.path || null;
      const assinatura = req.files['assinatura']?.[0]?.path || null;
  
      // Verifica o último ponto do funcionário
      const ultimoPonto = await Ponto.findOne({
        where: { funcionario_id },
        order: [['data_hora', 'DESC']]
      });
  
      // ⚠️ Regra de validação
      if (ultimoPonto) {
        if (ultimoPonto.tipo === tipo) {
          return res.status(400).json({
            error: `Não é permitido registrar duas ${tipo}s seguidas sem alternância.`
          });
        }
  
        // Se tentar registrar nova entrada sem ter registrado uma saída
        if (ultimoPonto.tipo === 'entrada' && tipo === 'entrada') {
          return res.status(400).json({
            error: 'Você já registrou uma entrada. Registre a saída antes de uma nova entrada.'
          });
        }
      }
  
      const ponto = await Ponto.create({
        funcionario_id,
        tipo,
        foto,
        assinatura,
        data_hora: new Date(),
      });
  
      res.status(201).json(ponto);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: 'Erro ao registrar ponto' });
    }
  },
  
  async porFuncionario(req, res) {
    try {
      const funcionario_id = req.params.id;
      const pontos = await Ponto.findAll({
        where: { funcionario_id },
        order: [['data_hora', 'DESC']]
      });
      res.json(pontos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar registros do funcionário' });
    }
  },
  
  
  async exportarExcel(req, res) {
    try {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const pontos = await Ponto.findAll({
        where: {
          data_hora: { [Op.gte]: hoje }
        },
        include: [{ model: Funcionario, as: 'Funcionario' }]
      });

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Registros de Ponto');

      sheet.columns = [
        { header: 'Nome', key: 'nome', width: 30 },
        { header: 'Cargo', key: 'cargo', width: 25 },
        { header: 'Departamento', key: 'departamento', width: 25 },
        { header: 'Tipo', key: 'tipo', width: 15 },
        { header: 'Data/Hora', key: 'data_hora', width: 25 }
      ];

      pontos.forEach(ponto => {
        sheet.addRow({
          nome: ponto.Funcionario?.nome,
          cargo: ponto.Funcionario?.cargo,
          departamento: ponto.Funcionario?.departamento,
          tipo: ponto.tipo,
          data_hora: new Date(ponto.data_hora).toLocaleString('pt-BR')
        });
      });

      const filePath = path.join(__dirname, '../../uploads/registros-ponto.xlsx');
      await workbook.xlsx.writeFile(filePath);

      return res.download(filePath, 'registros-ponto.xlsx', err => {
        if (err) console.error('Erro ao enviar arquivo:', err);
        fs.unlink(filePath, () => {}); 
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro ao exportar registros' });
    }
  }
};
