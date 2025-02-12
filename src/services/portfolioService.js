const { Portfolio, PortfolioLike, PortfolioBookmark, Tag, PortfolioTag, Comment } = require('../models');
const s3Service = require('./s3Service');

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
    user_id: userId,
    title: data.title,
    duration_start: data.duration_start,
    duration_end: data.duration_end,
    role: data.role,
    job: data.job,
    company: data.company,
    description: data.description,
    cover_image: coverImageUrl,
  });

  // 태그 연결 (Portfolio_Tags 테이블)
  if (data.tags && data.tags.length > 0) {
    for (const tagName of data.tags) {
      let tag = await Tag.findOne({ where: { name: tagName } });
      if (!tag) {
        tag = await Tag.create({ name: tagName });
      }
      await PortfolioTag.create({ portfolio_id: portfolio.id, tag_id: tag.id });
    }
  }

  return portfolio;
};

/** 🔹 포트폴리오 상세 조회 */
exports.getPortfolioDetails = async (portfolioId) => {
  return await Portfolio.findByPk(portfolioId, {
    include: [
      { model: Tag, through: { attributes: [] }, attributes: ['id', 'name'] },
      { model: PortfolioLike, attributes: ['user_id'] },
    ],
  });
};

/** 🔹 포트폴리오 수정 */
exports.updatePortfolio = async (userId, portfolioId, data) => {
  const portfolio = await Portfolio.findByPk(portfolioId);
  if (!portfolio || portfolio.user_id !== userId) {
    return null; // 수정 권한 없음
  }

  // 포트폴리오 정보 업데이트
  await portfolio.update({
    title: data.title || portfolio.title,
    description: data.description || portfolio.description,
  });

  // 태그 업데이트 (기존 태그 제거 후 새로 추가)
  if (data.tags) {
    await PortfolioTag.destroy({ where: { portfolio_id: portfolioId } });

    for (const tagName of data.tags) {
      let tag = await Tag.findOne({ where: { name: tagName } });
      if (!tag) {
        tag = await Tag.create({ name: tagName });
      }
      await PortfolioTag.create({ portfolio_id: portfolio.id, tag_id: tag.id });
    }
  }

  return portfolio;
};

/** 🔹 포트폴리오 삭제 */
exports.deletePortfolio = async (userId, portfolioId) => {
  const portfolio = await Portfolio.findByPk(portfolioId);
  if (!portfolio || portfolio.user_id !== userId) {
    return false;
  }

  await portfolio.destroy();
  return true;
};

/** 🔹 포트폴리오 좋아요 추가/취소 */
exports.toggleLike = async (userId, portfolioId) => {
  const existingLike = await PortfolioLike.findOne({ where: { user_id: userId, portfolio_id: portfolioId } });

  if (existingLike) {
    await existingLike.destroy();
    return { liked: false };
  } else {
    await PortfolioLike.create({ user_id: userId, portfolio_id: portfolioId });
    return { liked: true };
  }
};

/****
🔹 포트폴리오 조회수 증가 (Redis 활용)
exports.incrementView = async (portfolioId, userIp) => {
  try {
    const redisKey = `portfolio:${portfolioId}:views`;  // 조회수 키
    const userKey = `portfolio:${portfolioId}:ip:${userIp}`; // 사용자별 조회 방지 키

    // ✅ 동일 IP의 중복 조회 방지 (1시간 동안 중복 방지)
    const hasViewed = await redisClient.get(userKey);
    if (!hasViewed) {
      // ✅ Redis에 조회수 증가
      await redisClient.incr(redisKey);

      // ✅ 1시간 동안 동일 IP 조회 방지
      await redisClient.set(userKey, 1, { EX: 3600 });
    }
  } catch (error) {
    console.error('❌ Error in incrementView:', error);
  }
};

exports.getPortfolioWithViews = async (portfolioId) => {
  try {
    const redisKey = `portfolio:${portfolioId}:views`;

    // ✅ Redis에서 조회수 가져오기
    let views = await redisClient.get(redisKey);

    if (!views) {
      // Redis에 조회수가 없으면 DB에서 조회 후 Redis에 저장
      const portfolio = await Portfolio.findByPk(portfolioId);
      views = portfolio ? portfolio.views : 0;
      await redisClient.set(redisKey, views);
    }

    return { views: parseInt(views, 10) };
  } catch (error) {
    console.error('❌ Error in getPortfolioWithViews:', error);
    return { views: 0 };
  }
};
***/
exports.incrementView = async (portfolioId) => {
    try {
      // ✅ 포트폴리오 조회수 +1 (DB 업데이트)
      const portfolio = await Portfolio.findByPk(portfolioId);
      if (!portfolio) {
        throw new Error('포트폴리오를 찾을 수 없습니다.');
      }

      portfolio.views += 1;
      await portfolio.save();

      return portfolio.views;
    } catch (error) {
      console.error('❌ 조회수 증가 오류:', error);
      throw error;
    }
};
exports.getPortfolioWithViews = async (portfolioId) => {
    try {
      // ✅ DB에서 조회수 포함하여 포트폴리오 조회
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


/** 🔹 포트폴리오 댓글 추가 */
exports.addComment = async (userId, portfolioId, content) => {
  return await Comment.create({ user_id: userId, portfolio_id: portfolioId, content });
};

/** 🔹 포트폴리오 댓글 삭제 */
exports.deleteComment = async (userId, commentId) => {
  const comment = await Comment.findByPk(commentId);
  if (!comment || comment.user_id !== userId) {
    return false;
  }
  await comment.destroy();
  return true;
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
exports.getJobList = async () => {
  return ['프론트엔드 개발자', '백엔드 개발자', '데이터 엔지니어', 'UI/UX 디자이너', '그래픽 디자이너'];
};

