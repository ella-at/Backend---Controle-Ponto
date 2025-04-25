const { Ponto, Funcionario } = require('../models');
const { Sequelize, Op } = require('sequelize'); 
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

module.exports = {

  // PONTOS DO DIA DE HOJE
  async listarHoje(req, res) {
    const agora = new Date();
    const inicioDiaBrasil = new Date(agora.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    inicioDiaBrasil.setHours(0, 0, 0, 0);


    try {
      const pontos = await Ponto.findAll({
        where: {
          data_hora: {
            [Op.gte]: inicioDiaBrasil
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

  // FUNCIONÁRIOS FALTANTES HOJE
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

  ////////////////////
  async registrar(req, res) {
    try {
      const { funcionario_id } = req.body;
      const foto = req.files['foto']?.[0]?.path || null;
      const assinatura = req.files['assinatura']?.[0]?.path || null;
  
      // ⚙️ Alternância automática de tipo
      let tipo = 'entrada';

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const entradaHoje = await Ponto.findOne({
        where: {
          funcionario_id,
          tipo: 'entrada',
          data_hora: { [Op.gte]: hoje }
        }
      });

      const ultimoPonto = await Ponto.findOne({
        where: { funcionario_id },
        order: [['data_hora', 'DESC']]
      });

      if (ultimoPonto && ultimoPonto.tipo === 'entrada') {
        tipo = 'saida';
      }

      // Bloquear SAÍDA se não houver ENTRADA no mesmo dia
      if (tipo === 'saida' && !entradaHoje) {
        return res.status(400).json({ error: 'Não é possível registrar SAÍDA sem ENTRADA registrada hoje.' });
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
  
  async registrarAssinaturaMobile(req, res) {
    try {
      const { funcionario_id, tipo = 'entrada' } = req.body;
      const assinatura = req.file?.path;
  
      if (!funcionario_id || !assinatura) {
        return res.status(400).json({ error: 'Dados incompletos' });
      }
  
      // Regras de negócio: impedir duplas entradas ou saídas
      const ultimoPonto = await Ponto.findOne({
        where: { funcionario_id },
        order: [['data_hora', 'DESC']]
      });
  
      if (ultimoPonto && ultimoPonto.tipo === tipo) {
        return res.status(400).json({
          error: `Já existe um registro de ${tipo}.`
        });
      }
      
      // Verificar ENTRADA no mesmo dia antes de permitir SAÍDA
      if (tipo === 'saida') {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
      
        const entradaHoje = await Ponto.findOne({
          where: {
            funcionario_id,
            tipo: 'entrada',
            data_hora: { [Op.gte]: hoje }
          }
        });
      
        if (!entradaHoje) {
          return res.status(400).json({
            error: 'Não é possível registrar SAÍDA sem ENTRADA registrada hoje.'
          });
        }
      }
      
  
      const ponto = await Ponto.create({
        funcionario_id,
        tipo,
        assinatura,
        foto: null,
        data_hora: new Date()
      });
  
      return res.status(201).json(ponto);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro ao registrar assinatura por dispositivo' });
    }
  },
  
  async registrarSaidaAdm(req, res) {
    try {
      const { funcionario_id, data_hora, responsavel_saida_adm } = req.body;
  
      if (!funcionario_id || !data_hora || !responsavel_saida_adm) {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
      }
  
      const ponto = await Ponto.create({
        funcionario_id,
        tipo: 'saida',
        data_hora,
        responsavel_saida_adm
      });
  
      return res.status(201).json(ponto);
    } catch (err) {
      console.error('Erro ao registrar saída administrativa:', err);
      return res.status(500).json({ error: 'Erro ao registrar saída administrativa.' });
    }
  },  

  async pontosPendentesPorData(req, res) {
    try {
      const data = req.query.data;
      if (!data) return res.status(400).json({ error: 'Data obrigatória' });
  
      // Buscar todos os pontos da data selecionada
      const pontosDoDia = await Ponto.findAll({
        where: Sequelize.where(
          Sequelize.fn('DATE', Sequelize.col('data_hora')),
          data
        ),
        include: [{ model: Funcionario, as: 'Funcionario' }],
        order: [['data_hora', 'ASC']]
      });
  
      const agrupados = {};
  
      for (const ponto of pontosDoDia) {
        const id = ponto.funcionario_id;
  
        if (!agrupados[id]) {
          agrupados[id] = {
            funcionario: ponto.Funcionario,
            entrada: null,
            saida: null
          };
        }
  
        if (ponto.tipo === 'entrada') {
          agrupados[id].entrada = ponto;
        }
  
        if (ponto.tipo === 'saida') {
          agrupados[id].saida = ponto;
        }
      }
  
      const pendentes = Object.values(agrupados).filter(reg => reg.entrada && !reg.saida);
  
      res.json(pendentes);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro ao buscar registros pendentes do dia' });
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

  async pendenciasSaida(req, res) {
    try {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0); // Início do dia de hoje
  
      const entradas = await Ponto.findAll({
        where: {
          tipo: 'entrada',
          data_hora: {
            [Op.lt]: hoje
          }
        },
        include: [{
          model: Funcionario,
          as: 'Funcionario',
          attributes: ['id', 'nome']
        }]
      });
  
      const pendencias = [];
  
      for (const entrada of entradas) {
        const entradaData = new Date(entrada.data_hora);
        entradaData.setHours(0, 0, 0, 0);
        const diaSeguinte = new Date(entradaData);
        diaSeguinte.setDate(diaSeguinte.getDate() + 1);
  
        const saida = await Ponto.findOne({
          where: {
            funcionario_id: entrada.funcionario_id,
            tipo: 'saida',
            data_hora: {
              [Op.gte]: entradaData,
              [Op.lt]: diaSeguinte
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
  
      // Remover duplicatas, mantendo a pendência mais antiga por funcionário
      const unicas = Object.values(
        pendencias.reduce((acc, curr) => {
          if (
            !acc[curr.funcionario_id] ||
            new Date(curr.data) < new Date(acc[curr.funcionario_id].data)
          ) {
            acc[curr.funcionario_id] = curr;
          }
          return acc;
        }, {})
      );
  
      res.json(unicas);
    } catch (err) {
      console.error('Erro ao buscar pendências de saída:', err);
      res.status(500).json({ error: 'Erro ao buscar pendências de saída' });
    }
  },  
  
  // EXPORTAR PONTOS PARA EXCEL
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
