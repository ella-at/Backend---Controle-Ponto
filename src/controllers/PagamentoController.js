const { Pagamento, Funcionario, Ponto } = require('../models');
const { Op, Sequelize } = require('sequelize');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

module.exports = {
  // Criar novo pagamento com comprovante
  async create(req, res) {
    try {
      const { funcionario_id, ponto_id } = req.body;
      const comprovanteUrl = req.file?.path || null;

      const pagamento = await Pagamento.create({
        funcionario_id,
        ponto_id,
        comprovante: comprovanteUrl,
      });

      res.status(201).json(pagamento);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: 'Erro ao registrar pagamento' });
    }
  },

  // Listar pagamentos por funcionário
  async listByFuncionario(req, res) {
    try {
      const pagamentos = await Pagamento.findAll({
        where: { funcionario_id: req.params.id },
        include: [{ model: Ponto }]
      });

      res.json(pagamentos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar pagamentos' });
    }
  },

  async pendentesPorDia(req, res) {
    try {
      const pontos = await Ponto.findAll({
        where: {
          tipo: 'entrada'
        },
        include: [{ model: Funcionario, as: 'Funcionario' }],
        order: [['data_hora', 'ASC']]
      });
  
      const agrupados = {};
  
      for (const ponto of pontos) {
        const data = ponto.data_hora.toISOString().split('T')[0];
  
        if (!agrupados[data]) agrupados[data] = [];
  
        const saida = await Ponto.findOne({
          where: {
            funcionario_id: ponto.funcionario_id,
            tipo: 'saida',
            data_hora: {
              [Op.gte]: new Date(data + 'T00:00:00'),
              [Op.lt]: new Date(data + 'T23:59:59')
            }
          }
        });
  
        const pagamento = await Pagamento.findOne({
          where: {
            ponto_id: ponto.id
          }
        });
  
        if (saida && !pagamento) {
          agrupados[data].push({
            nome: ponto.Funcionario.nome,
            cargo: ponto.Funcionario.cargo,
            departamento: ponto.Funcionario.departamento,
            entrada: ponto.data_hora
          });
        }
      }
  
      res.json(agrupados);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro ao agrupar pagamentos pendentes por dia' });
    }
  },
  

  // Exportar pendentes de pagamento para Excel, filtrado por data
  async exportarPendentesExcel(req, res) {
    try {
      const data = req.query.data;
      if (!data) {
        return res.status(400).json({ error: 'Data é obrigatória.' });
      }

      // Buscar todos os pontos da data informada
      const pontos = await Ponto.findAll({
        where: Sequelize.where(
          Sequelize.fn('DATE', Sequelize.col('data_hora')),
          data
        ),
        include: [{ model: Funcionario, as: 'Funcionario' }],
        order: [['funcionario_id', 'ASC'], ['data_hora', 'ASC']]
      });

      // Agrupar entradas e saídas
      const agrupados = {};
      for (const ponto of pontos) {
        const id = ponto.funcionario_id;
        if (!agrupados[id]) {
          agrupados[id] = {
            funcionario: ponto.Funcionario,
            entrada: null,
            saida: null,
            pontoEntradaId: null,
            pontoSaidaId: null
          };
        }

        if (ponto.tipo === 'entrada') {
          agrupados[id].entrada = ponto.data_hora;
          agrupados[id].pontoEntradaId = ponto.id;
        }

        if (ponto.tipo === 'saida') {
          agrupados[id].saida = ponto.data_hora;
          agrupados[id].pontoSaidaId = ponto.id;
        }
      }

      // Buscar todos os pagamentos dos pontos encontrados
      const pontoIds = Object.values(agrupados).flatMap(a => [a.pontoEntradaId, a.pontoSaidaId]);
      const pagamentos = await Pagamento.findAll({
        where: {
          ponto_id: { [Op.in]: pontoIds }
        }
      });

      // Filtrar os funcionários com entrada e saída, mas ainda sem pagamento
      const pendentes = [];

      for (const id in agrupados) {
        const dados = agrupados[id];

        if (dados.entrada && dados.saida) {
          const pago = pagamentos.find(p =>
            p.ponto_id === dados.pontoEntradaId || p.ponto_id === dados.pontoSaidaId
          );

          if (!pago) {
            pendentes.push({
              nome: dados.funcionario.nome,
              cargo: dados.funcionario.cargo,
              departamento: dados.funcionario.departamento,
              entrada: dados.entrada,
              saida: dados.saida
            });
          }
        }
      }

      // Gerar planilha Excel
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet(`Pendentes - ${data}`);

      sheet.columns = [
        { header: 'Nome', key: 'nome', width: 30 },
        { header: 'Cargo', key: 'cargo', width: 25 },
        { header: 'Departamento', key: 'departamento', width: 25 },
        { header: 'Entrada', key: 'entrada', width: 25 },
        { header: 'Saída', key: 'saida', width: 25 }
      ];

      pendentes.forEach(p => {
        sheet.addRow({
          nome: p.nome,
          cargo: p.cargo,
          departamento: p.departamento,
          entrada: new Date(p.entrada).toLocaleString('pt-BR'),
          saida: new Date(p.saida).toLocaleString('pt-BR')
        });
      });

      // Salvar e enviar o arquivo para download
      const timestamp = Date.now();
      const filePath = path.join(__dirname, `../../uploads/pendentes-pagamento-${timestamp}.xlsx`);
      await workbook.xlsx.writeFile(filePath);

      return res.download(filePath, `pendentes-pagamento-${data}.xlsx`, err => {
        if (err) console.error('Erro ao enviar arquivo:', err);
        fs.unlink(filePath, () => {}); // Limpa o arquivo temporário após envio
      });
    } catch (err) {
      console.error('Erro na exportação:', err);
      return res.status(500).json({ error: 'Erro ao exportar pendentes.' });
    }
  }
};
