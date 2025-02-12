const express = require('express');
const navController = require('../controllers/navController');

const router = express.Router();

// 사용자 인증 상태 확인
router.get('/auth/status', navController.getAuthStatus);

// 검색 기능
router.get('/search', navController.search);

// 알림 리스트 조회
router.get('/notifications', navController.getNotifications);

module.exports = router;
