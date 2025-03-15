const { Portfolio, PortfolioLike, PortfolioBookmark, Tag, PortfolioTag } = require('../models');
const s3Service = require('./s3Service');
const axios = require('axios');

/** 🔹 포트폴리오 생성 */
exports.createPortfolio = async (userId, data, file) => {
  // S3에 표지 이미지 업로드
  let coverImageUrl = null;
  if (file) {
    const uploadResult = await s3Service.uploadFile(file, process.env.S3_BUCKET_NAME);
    coverImageUrl = uploadResult.Location;
  }

  // 포트폴리오 생성
  const portfolio = await Portfolio.create({
    userId: userId,
    title: data.title,
    durationStart: data.durationStart,
    durationEnd: data.durationEnd,
    role: data.role,
    job: data.job,
    company: data.company,
    description: data.description,
    url: data.url, // 추가된 URL 필드
    coverImage: coverImageUrl,
  });

  // 태그 연결 (Portfolio_Tags 테이블)
  if (data.tags && data.tags.length > 0) {
    for (const tagName of data.tags) {
      let tag = await Tag.findOne({ where: { name: tagName } });
      if (!tag) {
        tag = await Tag.create({ name: tagName });
      }
      await PortfolioTag.create({ portfolioId: portfolio.id, tagId: tag.id });
    }
  }

  return portfolio;
};

/** 🔹 포트폴리오 상세 조회 */
exports.getPortfolioDetails = async (portfolioId) => {
  return await Portfolio.findByPk(portfolioId, {
    include: [
      { model: Tag, through: { attributes: [] }, attributes: ['id', 'name'] },
      { model: PortfolioLike, attributes: ["userId"] },
      { model: Attachment, attributes: ["fileUrl"] }, // ✅ `file_url` → `fileUrl`
//      { model: PortfolioView, attributes: ["userIp"] }, // ✅ 조회 기록 포함
    ],
  });
};

/** 🔹 포트폴리오 수정 */
exports.updatePortfolio = async (userId, portfolioId, data) => {
  const portfolio = await Portfolio.findByPk(portfolioId);
  if (!portfolio || portfolio.userId !== userId) {
    return null; // 수정 권한 없음
  }

  // 포트폴리오 정보 업데이트
  await portfolio.update({
    title: data.title || portfolio.title,
    description: data.description || portfolio.description,
  });

  // 태그 업데이트 (기존 태그 제거 후 새로 추가)
  if (data.tags) {
    await PortfolioTag.destroy({ where: { portfolioId: portfolioId } });

    for (const tagName of data.tags) {
      let tag = await Tag.findOne({ where: { name: tagName } });
      if (!tag) {
        tag = await Tag.create({ name: tagName });
      }
      await PortfolioTag.create({ portfolioId: portfolio.id, tagId: tag.id });
    }
  }

  return portfolio;
};

/** 🔹 포트폴리오 삭제 */
exports.deletePortfolio = async (userId, portfolioId) => {
  const portfolio = await Portfolio.findByPk(portfolioId);
  if (!portfolio || portfolio.userId !== userId) {
    return false;
  }

  await portfolio.destroy();
  return true;
};

/** 🔹 포트폴리오 좋아요 추가/취소 */
exports.toggleLike = async (userId, portfolioId) => {
  const existingLike = await PortfolioLike.findOne({ where: { userId: userId, portfolioId: portfolioId } });

  if (existingLike) {
    await existingLike.destroy();
    return { liked: false };
  } else {
    await PortfolioLike.create({ userId, portfolioId });
    return { liked: true };
  }
};
/** 🔹 포트폴리오 조회수 증가 - Portfolio 테이블의 views 컬럼 사용 */
exports.incrementView = async (portfolioId) => {
  try {
    const portfolio = await Portfolio.findByPk(portfolioId);
    if (!portfolio) {
      throw new Error("포트폴리오를 찾을 수 없습니다.");
    }

    // Portfolio 테이블의 views 컬럼 값 증가
    portfolio.views = (portfolio.views || 0) + 1;
    await portfolio.save();

    return portfolio.views;
  } catch (error) {
    console.error("❌ 조회수 증가 오류:", error);
    throw error;
  }
};

/** 🔹 포트폴리오 조회수 포함 포트폴리오 조회 */
exports.getPortfolioWithViews = async (portfolioId) => {
  try {
    // DB에서 조회수 포함 포트폴리오 조회
    const portfolio = await Portfolio.findByPk(portfolioId);
    if (!portfolio) {
      throw new Error('포트폴리오를 찾을 수 없습니다.');
    }

    return {
      id: portfolio.id,
      title: portfolio.title,
      description: portfolio.description,
      views: portfolio.views
    };
  } catch (error) {
    console.error('❌ 포트폴리오 조회 오류:', error);
    throw error;
  }
};

/** 🔹 표지 이미지 업로드 */
exports.uploadCoverImage = async (file) => {
  const uploadResult = await s3Service.uploadFile(file, process.env.S3_BUCKET_NAME);
  return uploadResult.Location;
};

/** 🔹 첨부파일 업로드 */
exports.uploadAttachments = async (files) => {
  const urls = [];
  for (const file of files) {
    const uploadResult = await s3Service.uploadFile(file, process.env.S3_BUCKET_NAME);
    urls.push(uploadResult.Location);
  }
  return urls;
};

/** 🔹 직군 리스트 조회 */
exports.getCompanyList = async (query) => {
  const serviceKey = process.env.DATA_GO_KR_API_KEY; // 공공데이터포털 인증키
  const apiUrl = 'http://apis.data.go.kr/1160100/service/GetCorpBasicInfoService_V2/getAffiliate_V2';

  // 요청 파라미터 구성
  const params = {
    pageNo: 1,
    numOfRows: 10,
    resultType: 'json',
    fnccmpNm: query,  // 전달받은 검색어 사용
    serviceKey: serviceKey,
  };

  try {
    const response = await axios.get(apiUrl, { params });
    let companies = [];

    // API 응답 구조에 따라 회사명 추출
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
    console.error('Error fetching company list:', error);
    return [];
  }
};
