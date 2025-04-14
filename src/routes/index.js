const express = require('express');
const router = express.Router();

const funcionarioRoutes = require('./funcionarios');
const pontoRoutes = require('./pontos');
const pagamentosRoutes = require('./pagamentos');

router.use('/funcionarios', funcionarioRoutes);
router.use('/pontos', pontoRoutes);
router.use('/pagamentos', pagamentosRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

module.exports = router;
