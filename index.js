const app = require("./app");
const { sequelize } = require("./src/models"); // Sequelize DB 연결

const PORT = process.env.PORT || 3000;

// ✅ 테스트 환경에서는 서버 실행하지 않음
if (process.env.NODE_ENV !== "test") {
  sequelize
    .sync({ alter: true }) // DB 동기화 (alter 옵션: 기존 테이블 구조 변경 가능)
    .then(() => {
      console.log("✅ Database connected successfully");
      app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("❌ Database connection failed:", err);
    });
}

module.exports = app; // Jest에서 app 사용 가능

//sequelize
//  .sync({ alter: true }) // DB 동기화 (alter 옵션: 기존 테이블 구조 변경 가능)
//  .then(() => {
//    console.log("✅ Database connected successfully");
//    app.listen(PORT, () => {
//      console.log(`🚀 Server is running on port ${PORT}`);
//    });
//  })
//  .catch((err) => {
//    console.error("❌ Database connection failed:", err);
//  });
