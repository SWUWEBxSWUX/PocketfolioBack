const axios = require('axios');
const { Portfolio, Tag } = require('../models');

// 1. 추천 포트폴리오 조회 (좋아요/조회수 기준)
exports.getRecommendedPortfolios = async () => {
  return await Portfolio.findAll({
    attributes: ['id', 'title', 'coverImage', 'userName', 'views', 'likes'],
    order: [['likes', 'DESC'], ['views', 'DESC']],
    limit: 5,
  });
};
// 2. 직군(회사) 리스트 조회 → 금융위원회 API 호출로 변경
exports.getJobCategories = async (query) => {
  const serviceKey = process.env.DATA_GO_KR_API_KEY; // 공공데이터포털 인증키
  const apiUrl = 'http://apis.data.go.kr/1160100/service/GetCorpBasicInfoService_V2/getAffiliate_V2';

  // 요청 파라미터 구성
  const params = {
    pageNo: 1,
    numOfRows: 10,
    resultType: 'json',
    fnccmpNm: query, // 전달받은 검색어 사용
    serviceKey: serviceKey,
  };

  try {
    const response = await axios.get(apiUrl, { params });
    let companies = [];

    if (
      response.data &&
      response.data.response &&
      response.data.response.body &&
      response.data.response.body.items
    ) {
      const items = response.data.response.body.items;
      if (Array.isArray(items.item)) {
        companies = items.item.map(item => item.corpNm);
      } else if (items.item) {
        companies.push(items.item.corpNm);
      }
    }
    return companies;
  } catch (error) {
    console.error('Error fetching job categories (company list):', error);
    return [];
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