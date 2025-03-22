const models = require('../models'); // ✅ models 전체를 불러옴
const { sequelize, User, Portfolio, PortfolioLike, PortfolioBookmark, Tag, PortfolioTag, Attachment } = models;
const { Sequelize, Op, fn, col, literal } = require('sequelize'); // ✅ Sequelize 추가

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
  try {
    const portfolios = await Portfolio.findAll({
      attributes: [
        'id',
        'title',
        'coverImage',
        'views',
        'description',
        'createdAt',
        [fn('COUNT', col('PortfolioLikes.id')), 'likesCount'] // ✅ 실시간 COUNT()
      ],
      include: [
        { model: User, attributes: [] }, // ✅ User 테이블에서 name, email은 직접 처리
        { model: Tag, through: { attributes: [] }, attributes: ['id', 'name'] },
        { model: PortfolioLike, attributes: [] },
        { model: Attachment, attributes: ["fileUrl"] }
      ],
      group: ['Portfolio.id'],
      raw: true, // ✅ JSON 변환 필요 없음
      nest: true // ✅ 중첩된 결과를 유지
    });

    if (!portfolios.length) throw new Error('포트폴리오를 찾을 수 없습니다.');

    let portfolioData = portfolios[0];

    // 🔥 User 정보에서 userName, userEmail 수동 추가
    const user = await User.findByPk(portfolioData.userId, { attributes: ['name', 'email'], raw: true });
    portfolioData.userName = user ? user.name : null;
    portfolioData.userEmail = user ? user.email : null;

    return portfolioData;
  } catch (error) {
    console.error('❌ 포트폴리오 조회 오류:', error);
    throw error;
  }
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
//exports.toggleLike = async (userId, portfolioId) => {
//  const existingLike = await PortfolioLike.findOne({ where: { userId: userId, portfolioId: portfolioId } });
//
//  if (existingLike) {
//    await existingLike.destroy();
//    return { liked: false };
//  } else {
//    await PortfolioLike.create({ userId, portfolioId });
//    return { liked: true };
//  }
//};

exports.toggleLike = async (userId, portfolioId) => {
  return await sequelize.transaction(async (t) => {
    const existingLike = await PortfolioLike.findOne({
      where: { userId, portfolioId },
      transaction: t
    });

    if (existingLike) {
      await existingLike.destroy({ transaction: t });
      return { liked: false };
    } else {
      await PortfolioLike.create({ userId, portfolioId }, { transaction: t });
      return { liked: true };
    }
  });
};


/** 🔹 포트폴리오 조회수 증가 - Portfolio 테이블의 views 컬럼 사용 */
exports.incrementView = async (portfolioId) => {
  try {
    const [updated] = await Portfolio.update(
      { views: sequelize.literal('views + 1') }, // ✅ views 증가
      { where: { id: portfolioId } }
    );

    if (updated === 0) throw new Error("포트폴리오를 찾을 수 없습니다.");

    return true;
  } catch (error) {
    console.error("❌ 조회수 증가 오류:", error);
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
