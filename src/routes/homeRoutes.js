const express = require('express');
const homeController = require('../controllers/homeController');

const router = express.Router();

// 포트폴리오 필터링
router.get('/portfolios/filter', homeController.filterPortfolios);

// 정렬된 포트폴리오 조회
router.get('/portfolios', homeController.getPortfolios);

// 6. 인기 태그 조회
router.get('/tags/popular', homeController.getPopularTags);

module.exports = router;
