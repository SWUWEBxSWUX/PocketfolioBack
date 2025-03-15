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
const Color = require("../db/color")(sequelize, DataTypes);
const Follow = require("../db/followers")(sequelize, DataTypes);
const Education = require("../db/education")(sequelize, DataTypes);
const Activity = require("../db/activity")(sequelize, DataTypes);

// ✅ 모델 관계 설정 (associate()를 명시적으로 호출)
const models = {
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
  Follow,
  Education,
  Activity,
};

// 관계 정의
User.hasMany(Portfolio, { foreignKey: "userId", onDelete: "CASCADE" });
Portfolio.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });

User.hasMany(PortfolioBookmark, { foreignKey: "userId" });
PortfolioBookmark.belongsTo(User, { foreignKey: "userId" });

User.hasMany(PortfolioLike, { foreignKey: "userId" });
PortfolioLike.belongsTo(User, { foreignKey: "userId" });

Portfolio.hasMany(Attachment, { foreignKey: "portfolioId" });
Attachment.belongsTo(Portfolio, { foreignKey: "portfolioId" });

Portfolio.hasMany(Color, { foreignKey: "portfolioId" });
Color.belongsTo(Portfolio, { foreignKey: "portfolioId" });

Portfolio.hasMany(PortfolioLike, { foreignKey: "portfolioId", as: "likes" });
PortfolioLike.belongsTo(Portfolio, {
  foreignKey: "portfolioId",
  as: "portfolio",
});

Portfolio.belongsToMany(Tag, {
  through: PortfolioTag,
  foreignKey: "portfolioId",
});
Tag.belongsToMany(Portfolio, { through: PortfolioTag, foreignKey: "tagId" });

module.exports = models;

//module.exports = {
//  sequelize,
//  User,
//  Article,
//  Portfolio,
//  PortfolioBookmark,
//  PortfolioLike,
//  PortfolioTag,
//  Tag,
//  Attachment,
//  Color,
//  Follow,
//  Education,
//  Activity,
//};
