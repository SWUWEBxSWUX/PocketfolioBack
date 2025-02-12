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
      verificationCode: { type: DataTypes.STRING(10), allowNull: true },
      verificationExpiresAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: "Users",
      timestamps: false,
    }
  );

  return User;
};
