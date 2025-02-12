module.exports = (sequelize, DataTypes) => {
  const PortfolioTag = sequelize.define(
    "PortfolioTag",
    {
      portfolioId: { type: DataTypes.BIGINT, allowNull: false },
      tagId: { type: DataTypes.BIGINT, allowNull: false },
    },
    {
      tableName: "Portfolio_Tags",
      timestamps: false,
    }
  );

  return PortfolioTag;
};
