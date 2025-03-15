module.exports = (sequelize, DataTypes) => {
  const Portfolio = sequelize.define(
    "Portfolio",
    {
      id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
      userId: { type: DataTypes.BIGINT, allowNull: false },
      title: { type: DataTypes.STRING(255), allowNull: false },
      durationStart: { type: DataTypes.DATE, allowNull: false },
      durationEnd: { type: DataTypes.DATE, allowNull: false },
      role: { type: DataTypes.STRING(100), allowNull: false },
      job: { type: DataTypes.STRING(50), allowNull: false },
      company: { type: DataTypes.STRING(100), allowNull: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      url: { type: DataTypes.TEXT, allowNull: true }, // 추가된 URL 필드
      coverImage: { type: DataTypes.STRING(255), allowNull: true },
      views: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
      likesCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "Portfolios",
      timestamps: false,
    }
  );

  return Portfolio;
};
