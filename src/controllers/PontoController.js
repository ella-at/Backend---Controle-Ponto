const { Ponto, Funcionario } = require('../models');
const { Sequelize, Op } = require('sequelize'); 
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

module.exports = {

  // PONTOS DO DIA DE HOJE
  async listarHoje(req, res) {
    try {
      const inicioDia = dayjs().tz('America/Sao_Paulo').startOf('day').toDate();

      const pontos = await Ponto.findAll({
        where: {
          data_hora: { [Op.gte]: inicioDia }
        },
        include: [{ model: Funcionario, as: 'Funcionario' }]
      });

      res.json(pontos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar pontos de hoje' });
    }
  },

  // PONTOS POR DATA
  async pontosPorData(req, res) {
    try {
      const data = req.query.data;
      if (!data) return res.status(400).json({ error: 'Data obrigatória' });

      const pontos = await Ponto.findAll({
        where: Sequelize.where(
          Sequelize.fn('DATE', Sequelize.col('data_hora')),
          data
        ),
        include: [{ model: Funcionario, as: 'Funcionario' }]
      });

      res.json(pontos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar pontos por data' });
    }
  },

  // FUNCIONÁRIOS FALTANTES HOJE
  async faltantes(req, res) {
    try {
      const hoje = dayjs().tz('America/Sao_Paulo').startOf('day').toDate();

      const funcionarios = await Funcionario.findAll();
      const registrosHoje = await Ponto.findAll({
        where: {
          tipo: 'entrada',
          data_hora: { [Op.gte]: hoje }
        }
      });

      const idsComEntrada = registrosHoje.map(r => r.funcionario_id);
      const faltando = funcionarios.filter(f => !idsComEntrada.includes(f.id));

      res.json(faltando);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar faltantes' });
    }
  },

  // PONTOS POR FUNCIONÁRIO
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

  // REGISTRAR PONTO (entrada/saida automática)
  async registrar(req, res) {
    try {
      const { funcionario_id } = req.body;
      const foto = req.files['foto']?.[0]?.path || null;
      const assinatura = req.files['assinatura']?.[0]?.path || null;

      let tipo = 'entrada';

      const inicioHoje = dayjs().tz('America/Sao_Paulo').startOf('day').toDate();
      const ultimoPontoHoje = await Ponto.findOne({
        where: { funcionario_id, data_hora: { [Op.gte]: inicioHoje } },
        order: [['data_hora', 'DESC']]
      });

      if (ultimoPontoHoje && ultimoPontoHoje.tipo === 'entrada') {
        tipo = 'saida';
      }

      const ponto = await Ponto.create({
        funcionario_id,
        tipo,
        foto,
        assinatura,
        data_hora: dayjs().tz('America/Sao_Paulo').toDate()
      });

      res.status(201).json(ponto);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: 'Erro ao registrar ponto' });
    }
  },
  
  // REGISTRAR ASSINATURA MOBILE
  async registrarAssinaturaMobile(req, res) {
    try {
      const { funcionario_id, tipo = 'entrada' } = req.body;
      const assinatura = req.file?.path;

      if (!funcionario_id || !assinatura) {
        return res.status(400).json({ error: 'Dados incompletos' });
      }

      const ultimoPonto = await Ponto.findOne({
        where: { funcionario_id },
        order: [['data_hora', 'DESC']]
      });

      if (ultimoPonto && ultimoPonto.tipo === tipo) {
        return res.status(400).json({ error: `Já existe um registro de ${tipo}.` });
      }

      const ponto = await Ponto.create({
        funcionario_id,
        tipo,
        assinatura,
        foto: null,
        data_hora: dayjs().tz('America/Sao_Paulo').toDate()
      });

      return res.status(201).json(ponto);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao registrar assinatura' });
    }
  },
  
  // REGISTRAR SAÍDA ADMINISTRATIVA
  async registrarSaidaAdm(req, res) {
    try {
      const { funcionario_id, data_hora, responsavel_saida_adm } = req.body;
  
      if (!funcionario_id || !data_hora || !responsavel_saida_adm) {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
      }
  
      const horarioBr = dayjs(data_hora).toDate();
  
      const ponto = await Ponto.create({
        funcionario_id,
        tipo: 'saida',
        data_hora: horarioBr,
        responsavel_saida_adm
      });
  
      return res.status(201).json(ponto);
    } catch (err) {
      console.error('Erro ao registrar saída administrativa:', err);
      return res.status(500).json({ error: 'Erro ao registrar saída administrativa' });
    }
  },
  
 

  async pontosPendentesPorData(req, res) {
    try {
      const pontos = await Ponto.findAll({
        where: { tipo: 'entrada' },
        include: [{ model: Funcionario, as: 'Funcionario' }],
        order: [['data_hora', 'ASC']]
      });
  
      const agrupados = {};
  
      for (const entrada of pontos) {
        const data = entrada.data_hora.toISOString().split('T')[0];
  
        const saida = await Ponto.findOne({
          where: {
            funcionario_id: entrada.funcionario_id,
            tipo: 'saida',
            data_hora: {
              [Op.gte]: new Date(data + 'T00:00:00'),
              [Op.lt]: new Date(data + 'T23:59:59')
            }
          }
        });
  
        if (!saida) {
          if (!agrupados[data]) agrupados[data] = [];
          agrupados[data].push({
            nome: entrada.Funcionario.nome,
            cargo: entrada.Funcionario.cargo,
            departamento: entrada.Funcionario.departamento,
            entrada: entrada.data_hora
          });
        }
      }
  
      res.json(agrupados);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro ao buscar saídas pendentes por dia' });
    }
  },  

  // PENDENTES DE SAÍDA POR DIA
  async pendenciasSaida(req, res) {
    try {
      const hoje = dayjs().tz('America/Sao_Paulo').startOf('day').toDate();

      const entradas = await Ponto.findAll({
        where: {
          tipo: 'entrada',
          data_hora: { [Op.lt]: hoje }
        },
        include: [{ model: Funcionario, as: 'Funcionario' }]
      });

      const pendencias = [];

      for (const entrada of entradas) {
        const saida = await Ponto.findOne({
          where: {
            funcionario_id: entrada.funcionario_id,
            tipo: 'saida',
            data_hora: {
              [Op.between]: [
                dayjs(entrada.data_hora).startOf('day').toDate(),
                dayjs(entrada.data_hora).endOf('day').toDate()
              ]
            }
          }
        });

        if (!saida) {
          pendencias.push({
            funcionario_id: entrada.funcionario_id,
            nome: entrada.Funcionario.nome,
            data: entrada.data_hora
          });
        }
      }

      const unicas = Object.values(pendencias.reduce((acc, curr) => {
        if (!acc[curr.funcionario_id] || new Date(curr.data) < new Date(acc[curr.funcionario_id].data)) {
          acc[curr.funcionario_id] = curr;
        }
        return acc;
      }, {}));

      res.json(unicas);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro ao buscar pendências' });
    }
  },
  
  // EXPORTAR PARA EXCEL
  async exportarExcel(req, res) {
    try {
      const hoje = dayjs().tz('America/Sao_Paulo').startOf('day').toDate();

      const pontos = await Ponto.findAll({
        where: { data_hora: { [Op.gte]: hoje } },
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
          data_hora: dayjs(ponto.data_hora).tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss')
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
