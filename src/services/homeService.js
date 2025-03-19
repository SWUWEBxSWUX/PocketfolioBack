const axios = require('axios');
const models = require('../models');
const { sequelize, User, Portfolio, PortfolioLike, PortfolioBookmark, Tag, PortfolioTag, Attachment } = models;


// 1. 추천 포트폴리오 조회 (좋아요/조회수 기준)
exports.getRecommendedPortfolios = async () => {
  try {
    const portfolios = await Portfolio.findAll({
      attributes: ['id', 'title', 'coverImage', 'views'],
      include: [
        { model: User, attributes: ['name'] },
        { model: PortfolioLike, attributes: ['id'], as: 'likes' } // ✅ `likes`는 전체 개수 확인용
      ]
    });

    // ✅ `likes.length`로 정렬
    portfolios.sort((a, b) => b.likes.length - a.likes.length || b.views - a.views);

    return portfolios.slice(0, 5); // 상위 5개만 반환
  } catch (error) {
    console.error('❌ 추천 포트폴리오 조회 오류:', error);
    throw error;
  }
};

// 2. 직군(회사) 리스트 조회 → 금융위원회 API 호출로 변경
exports.getJobCategories = async (query) => {
  const serviceKey = process.env.DATA_GO_KR_API_KEY; // 공공데이터포털 인증키
  const apiUrl = 'http://apis.data.go.kr/1160100/service/GetCorpBasicInfoService_V2/getAffiliate_V2';

  // ✅ 요청 파라미터 구성
  const params = {
    pageNo: 1,
    numOfRows: 10,
    resultType: 'json',
    fnccmpNm: query, // 전달받은 검색어 사용
    serviceKey: serviceKey,
  };

  console.log("🟢 [DEBUG] getJobCategories 실행됨 🟢");

  try {
    // ✅ API 요청 URL 로그 추가
    const requestUrl = `${apiUrl}?pageNo=${params.pageNo}&numOfRows=${params.numOfRows}&resultType=${params.resultType}&fnccmpNm=${encodeURIComponent(query)}&serviceKey=${serviceKey}`;
    console.log("🔹 요청 URL:", requestUrl);

    // ✅ API 요청
    const response = await axios.get(apiUrl, { params });

    console.log("🔹 API Response:", JSON.stringify(response.data, null, 2));

    // ✅ 응답 데이터가 존재하는지 확인
    const items = response?.data?.response?.body?.items?.item || [];

    if (!Array.isArray(items)) {
      console.warn("⚠️ API 응답에 'item' 데이터가 없음");
      return [];
    }

    // ✅ 회사명 리스트 추출
    const companies = items.map(item => {
      if (item.afilCmpyNm && typeof item.afilCmpyNm === 'object') {
        return item.afilCmpyNm['#text'] || null;
      }
      return item.afilCmpyNm;
    }).filter(Boolean); // `null` 값 제거

    console.log("✅ 최종 companies 리스트:", companies);
    return companies;
  } catch (error) {
    console.error('❌ Error fetching job categories:', error);
    console.error("❌ 요청 URL:", requestUrl); // 에러 발생 시 요청 URL 출력
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
    attributes: ['id', 'title', 'thumbnail', 'userName', 'views', 'likesCount'],
    where: whereCondition,
  });
};
// 4. 정렬된 포트폴리오 조회
exports.getPortfolios = async (sort) => {
  let order = [['createdAt', 'DESC']];
  if (sort === 'likesCount') order = [['likes', 'DESC']];
  else if (sort === 'views') order = [['views', 'DESC']];

  return await Portfolio.findAll({
    attributes: ['id', 'title', 'thumbnail', 'userName', 'views', 'likesCount'],
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