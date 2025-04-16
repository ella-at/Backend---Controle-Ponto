const express = require('express');
const router = express.Router();
const pontoController = require('../controllers/pontoController');
const upload = require('../middlewares/upload');

router.post(
  '/',
  upload.fields([
    { name: 'foto', maxCount: 1 },
    { name: 'assinatura', maxCount: 1 }
  ]),
  pontoController.registrar
);

router.post(
  '/assinatura-mobile',
  upload.single('assinatura'),
  pontoController.registrarAssinaturaMobile
);



router.post('/saida-administrativa', pontoController.registrarSaidaAdm);


router.get('/hoje', pontoController.listarHoje);
router.get('/faltantes', pontoController.faltantes);
router.get('/por-data', pontoController.pontosPorData);

router.get('/exportar', pontoController.exportarExcel);
router.get('/por-funcionario/:id', pontoController.porFuncionario);
router.get('/funcionario/:id', pontoController.porFuncionario);

module.exports = router; 

