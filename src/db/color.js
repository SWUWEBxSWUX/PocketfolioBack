module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Color",
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      portfolioId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      hexCode: {
        type: DataTypes.STRING(7),
        allowNull: false,
      },
      key: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: "포트폴리오 고유 ID",
      },
    },
    {
      tableName: "Colors",
      timestamps: false,
    }
  );
};
