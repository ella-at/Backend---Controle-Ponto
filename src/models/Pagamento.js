module.exports = (sequelize, DataTypes) => {
  const Pagamento = sequelize.define('Pagamento', {
    comprovante: DataTypes.STRING,
  });

  Pagamento.associate = (models) => {
    Pagamento.belongsTo(models.Funcionario, {
      foreignKey: 'funcionario_id',
    });
    Pagamento.belongsTo(models.Ponto, {
      foreignKey: 'ponto_id',
    });
  };

  return Pagamento;
};
