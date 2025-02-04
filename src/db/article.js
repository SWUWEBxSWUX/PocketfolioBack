module.exports = (sequelize, DataTypes) => {
  const Article = sequelize.define(
    "Article",
    {
      id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING(100), allowNull: false },
      content: { type: DataTypes.STRING(255), allowNull: false },
      createdAt: { type: DataTypes.STRING(255), allowNull: true },
      updatedAt: { type: DataTypes.STRING(255), allowNull: true },
      views: { type: DataTypes.STRING(255), allowNull: true },
      image: { type: DataTypes.STRING(300), allowNull: true },
    },
    {
      tableName: "Articles",
      timestamps: false,
    }
  );

  return Article;
};
