const { Pagamento, Funcionario, Ponto } = require('../models');
const { Op } = require('sequelize');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

module.exports = {
  async create(req, res) {
    try {
      const { funcionario_id, ponto_id } = req.body;

      const comprovantePath = req.file?.path || '';
      const caminhoRelativo = comprovantePath
      ? `uploads/comprovantes/${path.basename(comprovantePath)}`
      : null;


      const pagamento = await Pagamento.create({
        funcionario_id,
        ponto_id,
        comprovante: caminhoRelativo,
      });
  
      res.status(201).json(pagamento);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: 'Erro ao registrar pagamento' });
    }
  },

  async listByFuncionario(req, res) {
    try {
      const pagamentos = await Pagamento.findAll({
        where: { funcionario_id: req.params.id },
        include: [{ model: Ponto }],
      });

      res.json(pagamentos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar pagamentos' });
    }
  },

  async exportarPendentes(req, res) {
    try {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const pontos = await Ponto.findAll({
        where: { data_hora: { [Op.gte]: hoje } },
        include: [{ model: Funcionario, as: 'Funcionario' }]
      });

      const funcionariosMap = {};

      pontos.forEach((ponto) => {
        const id = ponto.funcionario_id;
        if (!funcionariosMap[id]) {
          funcionariosMap[id] = {
            funcionario: ponto.Funcionario,
            tipos: [],
            pontoIds: []
          };
        }

        funcionariosMap[id].tipos.push(ponto.tipo);
        funcionariosMap[id].pontoIds.push(ponto.id);
      });

      const pendentes = [];

      for (const id in funcionariosMap) {
        const dados = funcionariosMap[id];
        if (dados.tipos.includes('entrada') && dados.tipos.includes('saida')) {
          const pagamentos = await Pagamento.findAll({
            where: {
              funcionario_id: id,
              createdAt: { [Op.gte]: hoje }
            }
          });
          if (!pagamentos.length) {
            pendentes.push(dados.funcionario);
          }
        }
      }

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Pendentes');

      sheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Nome', key: 'nome', width: 30 },
        { header: 'Cargo', key: 'cargo', width: 20 },
        { header: 'Departamento', key: 'departamento', width: 20 },
        { header: 'PIX', key: 'pix', width: 30 }
      ];

      pendentes.forEach((f) => {
        sheet.addRow({
          id: f.id,
          nome: f.nome,
          cargo: f.cargo,
          departamento: f.departamento,
          pix: f.pix
        });
      });

      const filePath = path.join(__dirname, '../../uploads/pendentes-pagamento.xlsx');
      await workbook.xlsx.writeFile(filePath);

      return res.download(filePath, 'pendentes-pagamento.xlsx', (err) => {
        if (err) console.error('Erro ao baixar Excel:', err);
        fs.unlink(filePath, () => {});
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro ao exportar pendentes' });
    }
  }
};
