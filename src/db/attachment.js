module.exports = (sequelize, DataTypes) => {
  const Attachment = sequelize.define(
    "Attachment",
    {
      id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
      portfolioId: { type: DataTypes.BIGINT, allowNull: false },
      fileUrl: { type: DataTypes.STRING(255), allowNull: false },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "Attachments",
      timestamps: false,
    }
  );

  return Attachment;
};
