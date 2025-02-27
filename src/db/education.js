module.exports = (sequelize, DataTypes) => {
  const Education = sequelize.define(
    "Education",
    {
      education_id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      school: { type: DataTypes.STRING(100), allowNull: false },
      status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "저학, 휴학, 졸업 등",
      },
      startDate: { type: DataTypes.DATE, allowNull: false, comment: "입학일" },
      endDate: { type: DataTypes.DATE, allowNull: false, comment: "졸업일" },
      user_id: { type: DataTypes.BIGINT, allowNull: false },
    },
    {
      tableName: "Education",
      timestamps: false,
    }
  );

  Education.associate = (models) => {
    Education.belongsTo(models.User, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
    });
  };

  return Education;
};
