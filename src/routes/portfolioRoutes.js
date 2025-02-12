const express = require('express');
const multer = require('multer');
const portfolioController = require('../controllers/portfolioController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // S3 업로드용

/** 🔹 포트폴리오 생성 */
router.post('/create', authMiddleware, portfolioController.createPortfolio);

/** 🔹 포트폴리오 상세 조회 (조회수 포함)*/
router.get('/:id', portfolioController.getPortfolio);

/** 🔹 포트폴리오 수정 */
router.patch('/:id', authMiddleware, portfolioController.updatePortfolio);

/** 🔹 포트폴리오 삭제 */
router.delete('/:id', authMiddleware, portfolioController.deletePortfolio);

/** 🔹 포트폴리오 좋아요 추가/취소 */
router.post('/:id/like', authMiddleware, portfolioController.toggleLike);

/** 🔹 포트폴리오 조회수 증가 */
router.post('/:id/view', portfolioController.incrementView);


/** 🔹 포트폴리오 댓글 추가 */
router.post('/:id/comments', authMiddleware, portfolioController.addComment);

/** 🔹 포트폴리오 댓글 삭제 */
router.delete('/comments/:comment_id', authMiddleware, portfolioController.deleteComment);

/** 🔹 표지 이미지 업로드 */
router.post('/upload-cover', authMiddleware, upload.single('coverImage'), portfolioController.uploadCoverImage);

/** 🔹 첨부파일 업로드 */
router.post('/upload-attachments', authMiddleware, upload.array('files'), portfolioController.uploadAttachments);

/** 🔹 직군 리스트 조회 */
router.get('/jobs', portfolioController.getJobList);

module.exports = router;
