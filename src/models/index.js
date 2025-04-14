const Sequelize = require('sequelize');
const sequelize = require('../config/db'); // sua instância do Sequelize

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Modelos
db.Funcionario = require('./Funcionario')(sequelize, Sequelize.DataTypes);
db.Ponto = require('./Ponto')(sequelize, Sequelize.DataTypes);
db.Pagamento = require('./Pagamento')(sequelize, Sequelize.DataTypes);

// Associações
db.Funcionario.associate(db);
db.Ponto.associate(db);
db.Pagamento.associate(db);

module.exports = db;
