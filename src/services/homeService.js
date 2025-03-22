const axios = require('axios');
const models = require('../models');
const { sequelize, User, Portfolio, PortfolioLike, PortfolioBookmark, Tag, PortfolioTag, Attachment } = models;
const { Op, fn, col, literal } = require('sequelize'); // Sequelize 연산자 추가

// 1. 추천 포트폴리오 조회 (좋아요/조회수 기준)
exports.getRecommendedPortfolios = async () => {
  try {
    const portfolios = await Portfolio.findAll({
      attributes: [
        'id',
        'title',
        'coverImage',
        'views',
        [Sequelize.fn('COUNT', Sequelize.col('PortfolioLikes.id')), 'likesCount'] // 실시간 COUNT()
      ],
      include: [
        { model: User, attributes: ['name'] },
        { model: PortfolioLike, attributes: [] } // COUNT()만 필요하므로 attributes 비움
      ],
      group: ['Portfolio.id', 'User.id'], // User와 Portfolio를 기준으로 그룹화
      order: [[Sequelize.literal('likesCount'), 'DESC'], ['views', 'DESC']], // 좋아요 → 조회수 순 정렬
      limit: 5 // 상위 5개만 반환
    });

    return portfolios;
  } catch (error) {
    console.error('❌ 추천 포트폴리오 조회 오류:', error);
    throw error;
  }
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
    whereCondition.createdAt = { [Op.gte]: date };
  }

  return await Portfolio.findAll({
    attributes: [
      'id',
      'title',
      'thumbnail',
      'userName',
      'views',
      [Sequelize.fn('COUNT', Sequelize.col('PortfolioLikes.id')), 'likesCount'] // ✅ 실시간 COUNT()
    ],
    include: [
      { model: PortfolioLike, attributes: [] } // ✅ likesCount를 COUNT()로 반영
    ],
    group: ['Portfolio.id'],
  });
};

// 4. 정렬된 포트폴리오 조회
exports.getPortfolios = async (sort) => {
  let order = [['createdAt', 'DESC']];
  if (sort === 'likesCount') order = [[Sequelize.literal('likesCount'), 'DESC']];
  else if (sort === 'views') order = [['views', 'DESC']];

  return await Portfolio.findAll({
    attributes: [
      'id',
      'title',
      'thumbnail',
      'userName',
      'views',
      [Sequelize.fn('COUNT', Sequelize.col('PortfolioLikes.id')), 'likesCount'] // ✅ 실시간 COUNT()
    ],
    include: [{ model: PortfolioLike, attributes: [] }], // ✅ PortfolioLike 테이블을 포함 (COUNT용)
    group: ['Portfolio.id'],
    order
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