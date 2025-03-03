module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(50), allowNull: false },
      email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
      password: { type: DataTypes.STRING(100), allowNull: true },
      joinedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      profileImage: { type: DataTypes.STRING(300), allowNull: true },
      introduce: { type: DataTypes.STRING(1000), allowNull: true }, //추가!
      verificationCode: { type: DataTypes.STRING(10), allowNull: true },
      verificationExpiresAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: "Users",
      timestamps: false,
    }
  );

  User.associate = (models) => {
    User.hasMany(models.Education, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
    });
    User.hasMany(models.Activity, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
    });

    User.belongsToMany(User, {
      as: "Followers",
      through: models.Follow,
      foreignKey: "user_id",
      otherKey: "follower_id",
    });

    User.belongsToMany(User, {
      as: "Following",
      through: models.Follow,
      foreignKey: "follower_id",
      otherKey: "user_id",
    });
  };

  return User;
};
