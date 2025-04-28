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
    responsavel_saida_adm: DataTypes.STRING,
    funcionario_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    confirmado: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'pontos',
    underscored: false, 
    timestamps: true    
  });

  Ponto.associate = (models) => {
    Ponto.belongsTo(models.Funcionario, {
      foreignKey: 'funcionario_id',
      as: 'Funcionario'
    });
  };

  return Ponto;
};
