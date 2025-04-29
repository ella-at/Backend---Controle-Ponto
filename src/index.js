const express = require('express');
const cors = require('cors');
const path = require('path'); 
const routes = require('./routes');
const db = require('./models');
require('dotenv').config();

const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


db.sequelize.sync({ alter: true }) 
  .then(() => console.log('Tabelas sincronizadas com sucesso!'))
  .catch((err) => console.error('Erro ao sincronizar tabelas:', err));


app.use('/', routes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);

const path = require('path');


app.use(express.static(path.join(__dirname, 'dist')));


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

});
