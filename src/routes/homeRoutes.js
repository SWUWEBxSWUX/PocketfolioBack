const express = require('express');
const homeController = require('../controllers/homeController');

const router = express.Router();

// 추천 포트폴리오 조회
router.get('/portfolios/recommend', homeController.getRecommendedPortfolios);

// 최근 업로드 포트폴리오 조회
router.get('/portfolios/recent', homeController.getRecentPortfolios);

// 인기 태그 조회
router.get('/tags/popular', homeController.getPopularTags);

// 직군 리스트 조회
router.get('/jobs', homeController.getJobList);

module.exports = router;
