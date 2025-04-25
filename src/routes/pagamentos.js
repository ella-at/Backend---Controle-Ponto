const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload'); 
const PagamentoController = require('../controllers/PagamentoController');
const pontoController = require('../controllers/PontoController');




router.post('/', upload.single('comprovante'), PagamentoController.create);
router.post('/saida-administrativa', pontoController.registrarSaidaAdm);
router.get('/funcionario/:id', PagamentoController.listByFuncionario);
router.get('/pendentes/excel', PagamentoController.exportarPendentesExcel);
router.get('/pendentes-por-dia', PagamentoController.pendentesPorDia);

module.exports = router;
