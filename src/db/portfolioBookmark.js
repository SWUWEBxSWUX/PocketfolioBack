module.exports = (sequelize, DataTypes) => {
  const PortfolioBookmark = sequelize.define(
    "PortfolioBookmark",
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
      tableName: "Portfolio_Bookmarks",
      timestamps: false,
    }
  );

  return PortfolioBookmark;
};
