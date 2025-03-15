module.exports = (sequelize, DataTypes) => {
  const PortfolioView = sequelize.define(
    "PortfolioView",
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
      userIp: {
        type: DataTypes.STRING(45),
      },
    },
    {
      tableName: "PortfolioViews",
      timestamps: false,
    }
  );

  return PortfolioView;
};
