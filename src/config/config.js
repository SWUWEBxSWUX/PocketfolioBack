require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME, // 데이터베이스 이름
  process.env.DB_USER, // 사용자명
  process.env.DB_PASS, // 비밀번호
  {
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: process.env.DEV_DB_DIALECT || "mysql",
    port: process.env.DB_PORT || 3306,
    logging: false, // SQL 로그 출력하지 않으려면 false
  }
);

module.exports = { sequelize };
