const portfolioService = require('../services/portfolioService');

/** 🔹 포트폴리오 생성 */
exports.createPortfolio = async (req, res) => {
  try {
    console.log("📌 `res.locals.decoded` 값:", res.locals.decoded); // ✅ 확인용 로그 추가
    if (!res.locals.decoded) {
      return res.status(401).json({ message: "인증 정보가 없습니다." });
    }

    const { title, durationStart, durationEnd, role, job, company, description, tags } = req.body;
    const userId = res.locals.decoded.id
    const file = req.file; // 표지 이미지 (선택 사항)
    const attachments = req.files ? req.files.map(file => file.location) : [];

    const portfolio = await portfolioService.createPortfolio(userId, {
      title,
      durationStart,
      durationEnd,
      role,
      job,
      company,
      description,
      tags,
      attachments,
    }, file);

    res.status(201).json({ message: '포트폴리오가 생성되었습니다.', portfolio });
  } catch (error) {
    console.error('Error creating portfolio:', error);
    res.status(500).json({ message: '포트폴리오 생성 중 오류가 발생했습니다.' });
  }
};

/** 🔹 포트폴리오 상세 조회 */
exports.getPortfolioDetails = async (req, res) => {
  try {
    const portfolio = await portfolioService.getPortfolioDetails(req.params.id);
    if (!portfolio) {
      return res.status(404).json({ message: '포트폴리오를 찾을 수 없습니다.' });
    }
    res.status(200).json({ portfolio });
  } catch (error) {
    console.error('Error fetching portfolio details:', error);
    res.status(500).json({ message: '포트폴리오 조회 중 오류가 발생했습니다.' });
  }
};
/** 🔹 포트폴리오 상세 조회-포트폴리오 정보와 조회수를 함께 반환하는 API */
exports.getPortfolio = async (req, res) => {
    const { id } = req.params;

    try {
      const portfolio = await portfolioService.getPortfolioWithViews(id);
      res.status(200).json(portfolio);
    } catch (error) {
      res.status(500).json({ error: '포트폴리오 조회 실패' });
    }
  };

/** 🔹 포트폴리오 수정 */
exports.updatePortfolio = async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const portfolioId = req.params.id;
    const userId = req.user.id;

    const updatedPortfolio = await portfolioService.updatePortfolio(userId, portfolioId, { title, description, tags });

    if (!updatedPortfolio) {
      return res.status(403).json({ message: '수정 권한이 없습니다.' });
    }

    res.status(200).json({ message: '포트폴리오가 수정되었습니다.', portfolio: updatedPortfolio });
  } catch (error) {
    console.error('Error updating portfolio:', error);
    res.status(500).json({ message: '포트폴리오 수정 중 오류가 발생했습니다.' });
  }
};

/** 🔹 포트폴리오 삭제 */
exports.deletePortfolio = async (req, res) => {
  try {
    const portfolioId = req.params.id;
    const userId = req.user.id;

    const isDeleted = await portfolioService.deletePortfolio(userId, portfolioId);

    if (!isDeleted) {
      return res.status(403).json({ message: '삭제 권한이 없습니다.' });
    }

    res.status(200).json({ message: '포트폴리오가 삭제되었습니다.' });
  } catch (error) {
    console.error('Error deleting portfolio:', error);
    res.status(500).json({ message: '포트폴리오 삭제 중 오류가 발생했습니다.' });
  }
};

/** 🔹 포트폴리오 좋아요 추가/취소 */
exports.toggleLike = async (req, res) => {
  try {
    const portfolioId = req.params.id;
    const userId = req.user.id;

    const result = await portfolioService.toggleLike(userId, portfolioId);
    res.status(200).json({ message: '좋아요 상태가 변경되었습니다.', liked: result.liked });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ message: '좋아요 처리 중 오류가 발생했습니다.' });
  }
};

/** 🔹 포트폴리오 조회수 증가 */
exports.incrementView = async (req, res) => {
    const { id } = req.params;
    //const userIp = req.ip;  // 클라이언트 IP 가져오기

    try {
      await portfolioService.incrementView(id);
      res.status(200).json({ message: '조회수 증가 완료' });
    } catch (error) {
      res.status(500).json({ error: '조회수 증가 실패' });
    }
  };

/** 🔹 포트폴리오 댓글 추가 */
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const portfolioId = req.params.id;
    const userId = req.user.id;

    const comment = await portfolioService.addComment(userId, portfolioId, content);
    res.status(201).json({ message: '댓글이 추가되었습니다.', comment });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: '댓글 추가 중 오류가 발생했습니다.' });
  }
};

/** 🔹 포트폴리오 댓글 삭제 */
exports.deleteComment = async (req, res) => {
  try {
    const commentId = req.params.comment_id;
    const userId = req.user.id;

    const isDeleted = await portfolioService.deleteComment(userId, commentId);

    if (!isDeleted) {
      return res.status(403).json({ message: '댓글 삭제 권한이 없습니다.' });
    }

    res.status(200).json({ message: '댓글이 삭제되었습니다.' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: '댓글 삭제 중 오류가 발생했습니다.' });
  }
};

/** 🔹 표지 이미지 업로드 */
exports.uploadCoverImage = async (req, res) => {
  try {
    const file = req.file;
    const url = await portfolioService.uploadCoverImage(file);
    res.status(200).json({ message: '표지 이미지 업로드 성공', url });
  } catch (error) {
    console.error('Error uploading cover image:', error);
    res.status(500).json({ message: '표지 이미지 업로드 중 오류가 발생했습니다.' });
  }
};

/** 🔹 첨부파일 업로드 */
exports.uploadAttachments = async (req, res) => {
  try {
    const files = req.files;
    const urls = await portfolioService.uploadAttachments(files);
    res.status(200).json({ message: '첨부파일 업로드 성공', urls });
  } catch (error) {
    console.error('Error uploading attachments:', error);
    res.status(500).json({ message: '첨부파일 업로드 중 오류가 발생했습니다.' });
  }
};

/** 🔹 직군 리스트 조회 */
exports.getJobList = async (req, res) => {
  try {
    const jobs = await portfolioService.getJobList();
    res.status(200).json({ data: jobs });
  } catch (error) {
    console.error('Error fetching job list:', error);
    res.status(500).json({ message: '직군 리스트 조회 중 오류가 발생했습니다.' });
  }
};
