const express = require("express");
const router = express.Router();

const mypageFetchController = require("../controllers/mypage/fetchInfoController");
const mypageEditController = require("../controllers/mypage/editInfoController");

// 마이페이지 개인정보 가져오기
router.get("/fetchInfo/:userId", mypageFetchController.fetchMypageInfo);

//마이페이지 포트폴리오 가져오기
router.get("/portfolio/:userId", mypageFetchController.fetchPortfolioInfo);

// 마이페이지 좋아요 표시한 포트폴리오 가져오기
router.get("/likes/:userId", mypageFetchController.fetchUserLikedPortfolios);

router.get("/bookmark/:userId", mypageFetchController.fetchUserBookmarks);

//마이페이지 수정
router.patch("/profile/save", mypageEditController.updateUserProfile);

module.exports = router;
