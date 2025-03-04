const express = require('express')

const { verifyToken } = require('../middlewares');
const { register, login, logout, findPassword, resetPassword, sendVerificationCode, verifyCode,  regSendVerificationCode, regVerifyCode} = require('../controllers/user');

const router = express.Router();

// 회원가입
router.post('/register', register);

 // 로그인 (JWT 발급)
router.post('/login', login);

// 로그아웃 (클라이언트에서 삭제))
router.post('/logout', logout);

// 비밀번호 찾기
router.post('/find-password', findPassword);

// 비밀번호 재설정
router.post('/reset-password', resetPassword);

// 인증번호 전송
router.post('/send-verification-code', sendVerificationCode);

// 인증번호 검증
router.post('/verify-code', verifyCode);

//인증번호 전송(회원가입 시)
router.post('/reg-send-verification-code', regSendVerificationCode);

//인증번호 검증(회원가입 시)
router.post('/reg-verify-code', regVerifyCode);

// JWT 검증이 제대로 되는지 확인용
router.get('/test', verifyToken, (req, res) => {
    res.json({ message: '토큰 인증 성공', user: res.locals.decoded });
});

module.exports = router;