const express = require("express");
const router = express.Router();

// ✅ 개별 라우트 파일 가져오기
// user.js 라우트
const userRoutes = require("./user");
const homeRoutes = require("./homeRoutes");
const navRoutes = require("./navRoutes");
const portfolioRoutes = require("./portfolioRoutes");
const mypage = require("./mypage");
const getCompanyRoutes = require("./getCompanyRoutes");

// 예제 라우트
router.get("/test", (req, res) => {
  res.json({ message: "API is working!" });
});

// ✅ API 엔드포인트 등록
// routes/user
router.use("/user", userRoutes);
router.use("/home", homeRoutes);
router.use("/nav", navRoutes);
router.use("/portfolio", portfolioRoutes);
router.use("/mypage", mypage);
router.use("/companies", getCompanyRoutes);

module.exports = router;
