module.exports = (sequelize, DataTypes) => {
  const Tag = sequelize.define(
    "Tag",
    {
      id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    },
    {
      tableName: "Tags",
      timestamps: false,
    }
  );

  return Tag;
};
