const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload'); // ✅ Mantenha esta linha
const PagamentoController = require('../controllers/PagamentoController');



router.post('/', upload.single('comprovante'), PagamentoController.create);
router.get('/funcionario/:id', PagamentoController.listByFuncionario);
router.get('/pendentes/excel', PagamentoController.exportarPendentes); 

module.exports = router;
