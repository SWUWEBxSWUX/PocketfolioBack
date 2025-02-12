module.exports = (sequelize, DataTypes) => {
  const PortfolioLike = sequelize.define(
    "PortfolioLike",
    {
      id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      portfolioId: { type: DataTypes.BIGINT, allowNull: false },
      userId: { type: DataTypes.BIGINT, allowNull: false },
    },
    {
      tableName: "Portfolio_Likes",
      timestamps: false,
    }
  );

  return PortfolioLike;
};
