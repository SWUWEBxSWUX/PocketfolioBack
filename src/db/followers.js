module.exports = (sequelize, DataTypes) => {
  const Follow = sequelize.define(
    "Follow",
    {
      follows_id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: { type: DataTypes.BIGINT, allowNull: false }, // 팔로우 당하는 사람
      follower_id: { type: DataTypes.BIGINT, allowNull: false }, // 팔로우 하는 사람
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "Follows",
      timestamps: false,
    }
  );

  Follow.associate = (models) => {
    Follow.belongsTo(models.User, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
    });
    Follow.belongsTo(models.User, {
      foreignKey: "follower_id",
      onDelete: "CASCADE",
    });
  };

  return Follow;
};
