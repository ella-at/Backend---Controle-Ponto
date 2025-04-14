module.exports = (sequelize, DataTypes) => {
  const Ponto = sequelize.define('Ponto', {
    tipo: {
      type: DataTypes.ENUM('entrada', 'saida'),
      allowNull: false,
    },
    data_hora: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    foto: DataTypes.STRING,
    assinatura: DataTypes.STRING,
    funcionario_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'pontos',
    underscored: false, // usa camelCase nos campos createdAt/updatedAt
    timestamps: true    // habilita createdAt/updatedAt automaticamente
  });

  Ponto.associate = (models) => {
    Ponto.belongsTo(models.Funcionario, {
      foreignKey: 'funcionario_id',
      as: 'Funcionario'
    });
  };

  return Ponto;
};
