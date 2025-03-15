const express = require('express');
const multer = require('multer');
const portfolioController = require('../controllers/portfolioController');
const { verifyToken } = require('../middlewares'); // ✅ 여기서 verifyToken만 가져오도록 수정!

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // S3 업로드용

/** 🔹 포트폴리오 생성 */
router.post('/create', verifyToken, portfolioController.createPortfolio);

/** 🔹 포트폴리오 상세 조회 */
router.get('/:id', portfolioController.getPortfolioDetails);

/** 🔹 포트폴리오 수정 */
router.patch('/:id', verifyToken, portfolioController.updatePortfolio);

/** 🔹 포트폴리오 삭제 */
router.delete('/:id', verifyToken, portfolioController.deletePortfolio);

/** 🔹 포트폴리오 좋아요 추가/취소 */
router.post('/:id/like', verifyToken, portfolioController.toggleLike);

/** 🔹 포트폴리오 조회수 증가 */
router.post('/:id/view', portfolioController.incrementView);


/** 🔹 포트폴리오 댓글 추가 */
router.post('/:id/comments', verifyToken, portfolioController.addComment);

/** 🔹 포트폴리오 댓글 삭제 */
router.delete('/comments/:comment_id', verifyToken, portfolioController.deleteComment);

/** 🔹 표지 이미지 업로드 */
router.post('/upload-cover', verifyToken, upload.single('coverImage'), portfolioController.uploadCoverImage);

/** 🔹 첨부파일 업로드 */
router.post('/upload-attachments', verifyToken, upload.array('files'), portfolioController.uploadAttachments);

/** 🔹 회사 정보 조회 엔드포인트: 쿼리 파라미터 q를 통해 검색어 전달 */
router.get('/companies', portfolioController.getCompanyList);

module.exports = router;
