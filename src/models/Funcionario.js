module.exports = (sequelize, DataTypes) => {
  const Funcionario = sequelize.define('Funcionario', {
    nome: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cargo: DataTypes.STRING,
    departamento: DataTypes.STRING,
    pix: DataTypes.STRING,
  }, {
    tableName: 'funcionarios'
  });

  Funcionario.associate = (models) => {
    Funcionario.hasMany(models.Ponto, {
      foreignKey: 'funcionario_id',
      as: 'pontos'
    });
    Funcionario.hasMany(models.Pagamento, {
      foreignKey: 'funcionario_id',
      as: 'pagamentos'
    });
  };

  return Funcionario;
};
