const homeService = require('../services/homeService');

exports.getRecommendedPortfolios = async (req, res) => {
  try {
    const portfolios = await homeService.fetchRecommendedPortfolios();
    res.status(200).json({ data: portfolios });
  } catch (error) {
    console.error('Error fetching recommended portfolios:', error);
    res.status(500).json({ message: '추천 포트폴리오 조회 중 오류가 발생했습니다.' });
  }
};

exports.getRecentPortfolios = async (req, res) => {
  try {
    const portfolios = await homeService.fetchRecentPortfolios();
    res.status(200).json({ data: portfolios });
  } catch (error) {
    console.error('Error fetching recent portfolios:', error);
    res.status(500).json({ message: '최근 포트폴리오 조회 중 오류가 발생했습니다.' });
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

exports.getJobList = async (req, res) => {
  try {
    const jobs = await homeService.fetchJobList();
    res.status(200).json({ data: jobs });
  } catch (error) {
    console.error('Error fetching job list:', error);
    res.status(500).json({ message: '직군 리스트 조회 중 오류가 발생했습니다.' });
  }
};
