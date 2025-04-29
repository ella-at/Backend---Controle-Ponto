'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const db = {};


const sequelize = require('../config/db'); 

// Carregar todos os modelos automaticamente
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Chamar associações
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

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
