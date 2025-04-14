const express = require('express');
const cors = require('cors');
const path = require('path'); // ✅ Só aqui
const routes = require('./routes');
const db = require('./models');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (ex: comprovantes de pagamento)
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); 

// Sincronização do banco de dados
db.sequelize.sync({ alter: true }) 
  .then(() => console.log('Tabelas sincronizadas com sucesso!'))
  .catch((err) => console.error('Erro ao sincronizar tabelas:', err));

// Rotas
app.use('/', routes);

// Inicialização do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
