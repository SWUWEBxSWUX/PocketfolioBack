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
        comment: "재학, 휴학, 졸업 등",
      },
      startDate: {
        type: DataTypes.STRING(4), // ✅ YYYY 형식으로 저장
        allowNull: false,
        comment: "입학년도 (YYYY)",
      },
      endDate: {
        type: DataTypes.STRING(4), // ✅ YYYY 형식으로 저장
        allowNull: true, // 현재 재학 중일 경우 null 허용
        comment: "졸업년도 (YYYY)",
      },
      user_id: { type: DataTypes.BIGINT, allowNull: false },
      educationType: {
        type: DataTypes.ENUM(
          "elem_list",
          "midd_list",
          "high_list",
          "univ_list",
          "seet_list",
          "alte_list"
        ),
        allowNull: false,
        comment: "학력 구분 (초등, 중등, 고등, 대학교, 전문대, 대안학교 등)",
      },
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
