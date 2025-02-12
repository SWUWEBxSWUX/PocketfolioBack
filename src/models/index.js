const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../config/config");

// 모델 정의
const User = require("../db/user")(sequelize, DataTypes);
const Article = require("../db/article")(sequelize, DataTypes);
const Portfolio = require("../db/portfolio")(sequelize, DataTypes);
const PortfolioBookmark = require("../db/portfolioBookmark")(
  sequelize,
  DataTypes
);
const PortfolioLike = require("../db/portfolioLike")(sequelize, DataTypes);
const PortfolioTag = require("../db/portfolioTag")(sequelize, DataTypes);
const Tag = require("../db/tag")(sequelize, DataTypes);
const Attachment = require("../db/attachment")(sequelize, DataTypes);
const PortfolioView = require("../db/portfolioView")(sequelize, DataTypes);
const Color = require("../db/color")(sequelize, DataTypes); // ✅ 수정된 Color 모델 불러오기

// 관계 정의
User.hasMany(Portfolio, { foreignKey: "userId" , onDelete: 'CASCADE'});
Portfolio.belongsTo(User, { foreignKey: "userId", onDelete: 'CASCADE' });

User.hasMany(PortfolioBookmark, { foreignKey: "userId" });
PortfolioBookmark.belongsTo(User, { foreignKey: "userId" });

User.hasMany(PortfolioLike, { foreignKey: "userId" });
PortfolioLike.belongsTo(User, { foreignKey: "userId" });

Portfolio.hasMany(Attachment, { foreignKey: "portfolioId" });
Attachment.belongsTo(Portfolio, { foreignKey: "portfolioId" });

Portfolio.hasMany(Color, { foreignKey: "portfolioId" });
Color.belongsTo(Portfolio, { foreignKey: "portfolioId" });

Portfolio.belongsToMany(Tag, {
  through: PortfolioTag,
  foreignKey: "portfolioId",
});
Tag.belongsToMany(Portfolio, { through: PortfolioTag, foreignKey: "tagId" });

module.exports = {
  sequelize,
  User,
  Article,
  Portfolio,
  PortfolioBookmark,
  PortfolioLike,
  PortfolioTag,
  Tag,
  Attachment,
  Color,
  PortfolioView,
};
