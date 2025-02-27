module.exports = (sequelize, DataTypes) => {
  const Activity = sequelize.define(
    "Activity",
    {
      activity_id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      activityName: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "활동명",
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "활동 시작일",
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "활동 종료일",
      },
      user_id: { type: DataTypes.BIGINT, allowNull: false },
    },
    {
      tableName: "Activity",
      timestamps: false,
    }
  );

  Activity.associate = (models) => {
    Activity.belongsTo(models.User, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
    });
  };

  return Activity;
};
