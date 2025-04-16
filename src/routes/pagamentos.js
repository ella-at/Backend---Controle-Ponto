const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload'); // ✅ Mantenha esta linha
const PagamentoController = require('../controllers/PagamentoController');
const pontoController = require('../controllers/pontoController');



router.post('/', upload.single('comprovante'), PagamentoController.create);
router.post('/pontos/saida-administrativa', pontoController.registrarSaidaAdministrativa);
router.get('/funcionario/:id', PagamentoController.listByFuncionario);
router.get('/pendentes/excel', PagamentoController.exportarPendentes); 

module.exports = router;
