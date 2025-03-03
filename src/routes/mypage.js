const express = require("express");
const mypageFetchController = require("../controllers/mypage/fetchInfoController");
const mypageEditController = require("../controllers/mypage/editInfoController");

const router = express.Router();

// 마이페이지 개인정보 가져오기
router.get("/mypage/fetchInfo/:userId", mypageFetchController.fetchMypageInfo);

//마이페이지 북마크한 포트폴리오 가져오기
router.get(
  "/mypage/portfolio/:userId",
  verifyToken,
  mypageFetchController.fetchPortfolioInfo
);

// 마이페이지 좋아요 표시한 포트폴리오 가져오기
router.get(
  "/mypage/likes/:userId",
  verifyToken,
  mypageFetchController.fetchUserLikedPortfolios
);

//마이페이지 수정
router.patch(
  "/mypage/profile/save",
  verifyToken,
  mypageEditController.updateUserProfile
);

module.exports = router;
