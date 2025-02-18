const { Portfolio, Tag } = require('../models');

// 1. 추천 포트폴리오 조회 (좋아요/조회수 기준)
exports.getRecommendedPortfolios = async () => {
  return await Portfolio.findAll({
    attributes: ['id', 'title', 'coverImage', 'userName', 'views', 'likes'],
    order: [['likes', 'DESC'], ['views', 'DESC']],
    limit: 5,
  });
};
// 2. 직군 리스트 반환
exports.getJobCategories = () => {
  return {
    developer: ['프론트엔드', '백엔드', '게임 클라이언트', '서버', 'AI'],
    designer: ['UX/UI', '3D', '그래픽', '로고', '영상', '일러스트'],
  };
};
// 3. 포트폴리오 필터링
exports.filterPortfolios = async (filters) => {
  const { tag, company, color, dateRange } = filters;
  let whereCondition = {};

  if (tag) whereCondition.tags = tag;
  if (company) whereCondition.company = company;
  if (color) whereCondition.color = color;
  if (dateRange) {
    let date = new Date();
    if (dateRange === '1주일') date.setDate(date.getDate() - 7);
    else if (dateRange === '1달') date.setMonth(date.getMonth() - 1);
    else if (dateRange === '6개월') date.setMonth(date.getMonth() - 6);
    else if (dateRange === '1년') date.setFullYear(date.getFullYear() - 1);
    else if (dateRange === '3년') date.setFullYear(date.getFullYear() - 3);
    whereCondition.createdAt = { [sequelize.Op.gte]: date };
  }

  return await Portfolio.findAll({
    attributes: ['id', 'title', 'thumbnail', 'userName', 'views', 'likes'],
    where: whereCondition,
  });
};
// 4. 정렬된 포트폴리오 조회
exports.getPortfolios = async (sort) => {
  let order = [['createdAt', 'DESC']];
  if (sort === 'likes') order = [['likes', 'DESC']];
  else if (sort === 'views') order = [['views', 'DESC']];

  return await Portfolio.findAll({
    attributes: ['id', 'title', 'thumbnail', 'userName', 'views', 'likes'],
    order,
  });
};

// 5. 추천 포트폴리오 변경 (DB 업데이트)
exports.updateRecommendedPortfolio = async (portfolioId) => {
  await Portfolio.update({ recommended: true }, { where: { id: portfolioId } });
};

// 6. 인기 태그 조회
exports.fetchPopularTags = async () => {
  return await Tag.findAll({
    order: [['usage_count', 'DESC']],
    limit: 10,
    attributes: ['id', 'name'],
  });
};