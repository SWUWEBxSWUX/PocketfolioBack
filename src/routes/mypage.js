const express = require("express");
const router = express.Router();

const mypageFetchController = require("../controllers/mypage/fetchInfoController");
const mypageEditController = require("../controllers/mypage/editInfoController");

const { verifyToken } = require("../middlewares/index"); // ✅ 인증 미들웨어 추가

// ✅ 모든 요청에 `verifyToken` 미들웨어 적용
router.get("/fetchInfo", verifyToken, mypageFetchController.fetchMypageInfo);
router.get("/portfolio", verifyToken, mypageFetchController.fetchPortfolioInfo);
router.get(
  "/likes",
  verifyToken,
  mypageFetchController.fetchUserLikedPortfolios
);
router.get("/bookmark", verifyToken, mypageFetchController.fetchUserBookmarks);
router.post(
  "/profile/save",
  verifyToken,
  mypageEditController.updateUserProfile
);

module.exports = router;
