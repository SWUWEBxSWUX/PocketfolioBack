// services/navService.js
const db = require('../models'); // Sequelize 모델 사용 (데이터베이스 연결)
const { sequelize, User, Portfolio, PortfolioLike, PortfolioBookmark, Tag, PortfolioTag, Attachment } = db;

// ✅ 1. 사용자 인증 상태 확인 (JWT에서 user ID 가져와서 조회)
exports.getAuthStatus = async (userId) => {
    try {
        const user = await User.findByPk(userId, {
            attributes: ['id', 'name', 'email'], // 필요한 정보만 반환
        });
        return user ? { isAuthenticated: true, user } : { isAuthenticated: false, user: null };
    } catch (error) {
        console.error('Error fetching auth status:', error);
        throw new Error('인증 상태 확인 중 오류 발생');
    }
};

// ✅ 2. 검색 기능 (포트폴리오, 사용자, 태그 검색)
exports.search = async (query, type) => {
    try {
        let results = [];

        if (type === 'user') {
            results = await User.findAll({
                where: { name: { [db.Sequelize.Op.like]: `%${query}%` } },
                attributes: ['id', 'name', 'email'],
            });
        } else if (type === 'portfolio') {
            results = await Portfolio.findAll({
                where: { title: { [db.Sequelize.Op.like]: `%${query}%` } },
                attributes: ['id', 'title', 'description'],
            });
        } else if (type === 'tag') {
            results = await db.Tag.findAll({
                where: { name: { [db.Sequelize.Op.like]: `%${query}%` } },
                attributes: ['id', 'name'],
            });
        }

        return results;
    } catch (error) {
        console.error('Error searching:', error);
        throw new Error('검색 중 오류 발생');
    }
};

// ✅ 3. 알림 리스트 조회 (사용자별 알림 불러오기)
exports.getNotifications = async (userId) => {
    try {
        const notifications = await Notification.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'message', 'createdAt'],
        });

        return notifications;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw new Error('알림 조회 중 오류 발생');
    }
};