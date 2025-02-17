const express = require('express');
const homeController = require('../controllers/homeController');

const router = express.Router();

// 추천 포트폴리오 조회
router.get('/portfolios/recommended', homeController.getRecommendedPortfolios);

// 직군 리스트 조회
router.get('/jobs/categories', homeController.getJobCategories);

// 포트폴리오 필터링
router.get('/portfolios/filter', homeController.filterPortfolios);

// 정렬된 포트폴리오 조회
router.get('/portfolios', homeController.getPortfolios);

// 추천 포트폴리오 변경
router.post('/portfolios/recommended/update', homeController.updateRecommendedPortfolio);

// 6. 인기 태그 조회
router.get('/tags/popular', homeController.getPopularTags);

module.exports = router;
