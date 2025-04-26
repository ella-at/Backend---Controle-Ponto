const express = require('express');
const router = express.Router();
const pontoController = require('../controllers/PontoController');
const upload = require('../middlewares/upload');

// Registro de ponto (com foto e assinatura)
router.post(
  '/',
  upload.fields([
    { name: 'foto', maxCount: 1 },
    { name: 'assinatura', maxCount: 1 }
  ]),
  pontoController.registrar
);

// Registro de assinatura via mobile (sem foto)
router.post(
  '/assinatura-mobile',
  upload.single('assinatura'),
  pontoController.registrarAssinaturaMobile
);

// Saída administrativa
router.post('/saida-administrativa', pontoController.registrarSaidaAdm);

// Consultas
router.get('/hoje', pontoController.listarHoje);
router.get('/faltantes', pontoController.faltantes);
router.get('/por-data', pontoController.pontosPorData);
router.get('/exportar', pontoController.exportarExcel);
router.get('/por-funcionario/:id', pontoController.porFuncionario);

// 🔥 Novas rotas:
router.get('/pendentes-por-dia', pontoController.pendentesPorDia);
router.get('/pendencias-saida', pontoController.pendenciasSaida);

module.exports = router;
