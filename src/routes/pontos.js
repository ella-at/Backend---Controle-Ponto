const express = require('express');
const router = express.Router();
const PontoController = require('../controllers/pontoController');
const upload = require('../middlewares/upload');

router.post(
  '/',
  upload.fields([
    { name: 'foto', maxCount: 1 },
    { name: 'assinatura', maxCount: 1 }
  ]),
  PontoController.registrar
);

router.post(
  '/assinatura-mobile',
  upload.single('assinatura'),
  PontoController.registrarAssinaturaMobile
);



router.post('/saida-administrativa', PontoController.registrarSaidaAdm);


router.get('/hoje', PontoController.listarHoje);
router.get('/faltantes', PontoController.faltantes);
router.get('/por-data', PontoController.pontosPorData);

router.get('/exportar', PontoController.exportarExcel);
router.get('/por-funcionario/:id', PontoController.porFuncionario);
router.get('/funcionario/:id', PontoController.porFuncionario);

module.exports = router; 

