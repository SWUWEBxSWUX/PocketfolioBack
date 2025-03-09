// controllers/navController.js
const navService = require('../services/navService');

// ✅ 1. 사용자 인증 상태 확인 (JWT 미들웨어에서 userId를 가져옴)
exports.getAuthStatus = async (req, res) => {
    try {
        console.log("📌 `req.user` 값:", req.user); // ✅ 로그 추가

        if (!req.user) {
            return res.status(401).json({ message: "인증 정보가 없습니다." });
        }

        const userId = req.user.id; // JWT에서 추출한 사용자 ID
        const authStatus = await navService.getAuthStatus(userId);
        res.status(200).json(authStatus);
    } catch (error) {
        console.error('Error checking auth status:', error);
        res.status(500).json({ message: error.message });
    }
};

// ✅ 2. 검색 기능
exports.search = async (req, res) => {
    try {
        const { query, type } = req.query; // 검색어 및 검색 타입
        const results = await navService.search(query, type);
        res.status(200).json({ results });
    } catch (error) {
        console.error('Error searching:', error);
        res.status(500).json({ message: error.message });
    }
};

// ✅ 3. 알림 리스트 조회
exports.getNotifications = async (req, res) => {
    try {
        console.log("📌 `req.user` 값:", req.user); // ✅ 로그 추가

        if (!req.user) {
            return res.status(401).json({ message: "인증 정보가 없습니다." });
        }

        const userId = req.user.id; // JWT에서 추출한 사용자 ID
        const notifications = await navService.getNotifications(userId);
        res.status(200).json({ notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: error.message });
    }
};

