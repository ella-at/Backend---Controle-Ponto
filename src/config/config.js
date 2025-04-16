require('dotenv').config();

module.exports = {
  development: {
    dialect: 'postgres',
    url: process.env.DATABASE_URL
  },
  production: {
    dialect: 'postgres',
    url: process.env.DATABASE_URL
  },
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('pontos', 'responsavel_saida_adm', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('pontos', 'responsavel_saida_adm');
  }
};
