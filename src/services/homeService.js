const { Portfolio, Tag } = require('../models');

// 추천 포트폴리오 조회
exports.fetchRecommendedPortfolios = async () => {
  return await Portfolio.findAll({
    order: [['likes', 'DESC']],
    limit: 5,
    attributes: ['id', 'title', 'cover_image', 'likes', 'views'],
  });
};

// 최근 업로드 포트폴리오 조회
exports.fetchRecentPortfolios = async () => {
  return await Portfolio.findAll({
    order: [['created_at', 'DESC']],
    limit: 5,
    attributes: ['id', 'title', 'cover_image', 'created_at'],
  });
};

// 인기 태그 조회
exports.fetchPopularTags = async () => {
  return await Tag.findAll({
    order: [['usage_count', 'DESC']],
    limit: 10,
    attributes: ['id', 'name'],
  });
};

// 직군 리스트 조회
exports.fetchJobList = async () => {
  return [
    // ✅ 개발자 직군
    '프론트엔드 개발자',
    '백엔드 개발자',
    '게임 클라이언트 개발자',
    '게임 서버 개발자',
    'AI 개발자',

    // ✅ 디자이너 직군
    'UX/UI 디자이너',
    '로고 디자이너',
    '영상 디자이너',
    '그래픽 디자이너',
    '3D 디자이너',
    '일러스트 디자이너',
  ];
};