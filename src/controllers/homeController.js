const homeService = require('../services/homeService');

// 1. 추천 포트폴리오 조회
exports.getRecommendedPortfolios = async (req, res) => {
  try {
    const portfolios = await homeService.getRecommendedPortfolios();
    res.status(200).json({ data: portfolios });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류' });
  }
};

exports.getPopularTags = async (req, res) => {
  try {
    const tags = await homeService.fetchPopularTags();
    res.status(200).json({ data: tags });
  } catch (error) {
    console.error('Error fetching popular tags:', error);
    res.status(500).json({ message: '인기 태그 조회 중 오류가 발생했습니다.' });
  }
};


// 2. 직군(회사) 리스트 조회 → 금융위원회 API 활용
exports.getJobCategories = async (req, res) => {
  try {
    console.log("🟢 [DEBUG] getJobCategories 컨트롤러 실행됨 🟢");

    // 프론트엔드에서 쿼리 파라미터 'q'로 검색어 전달, 없으면 기본값 사용
    const query = req.query.q || '메리츠자산운용';
    const companies = await homeService.getJobCategories(query);
    res.status(200).json({ data: companies });
  } catch (error) {
    console.error('Error in getJobCategories:', error);
    res.status(500).json({ message: '서버 오류' });
  }
};

// 3. 포트폴리오 필터링
exports.filterPortfolios = async (req, res) => {
  try {
    const { tag, company, color, dateRange } = req.query;
    const portfolios = await homeService.filterPortfolios({ tag, company, color, dateRange });
    res.status(200).json({ data: portfolios });
  } catch (error) {
    res.status(500).json({ message: '서버 오류' });
  }
};

// 4. 정렬된 포트폴리오 조회
exports.getPortfolios = async (req, res) => {
  try {
    const { sort } = req.query;
    const portfolios = await homeService.getPortfolios(sort);
    res.status(200).json({ data: portfolios });
  } catch (error) {
    res.status(500).json({ message: '서버 오류' });
  }
};

// 5. 추천 포트폴리오 변경
exports.updateRecommendedPortfolio = async (req, res) => {
  try {
    const { portfolioId } = req.body;
    await homeService.updateRecommendedPortfolio(portfolioId);
    res.status(200).json({ message: '추천 포트폴리오가 업데이트되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: '서버 오류' });
  }
};

