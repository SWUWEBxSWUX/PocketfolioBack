const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config(); // .env에서 JWT_SECRET 불러오기

exports.verifyToken = (req, res, next) => {
    try {
        // 'Bearer <token>' 형식에서 <token>만 추출하도록
        const token = req.headers.authorization?.split(' ')[1];  
        console.log('Extracted Token:', token);  // 토큰 값 확인

        if (!token) {
            return res.status(401).json({
                message: '토큰이 제공되지 않았습니다.',
            });
        }

        // JWT 토큰을 검증하고, decoded에 payload 정보가 담기도록
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded JWT:', decoded); // 디버깅용 로그, 토큰 검증 후 사용자 정보 확인

        // 토큰 검증이 성공적으로 되면, 사용자 정보(decoded)를 req.user에 저장
        req.user = decoded;

        // 확인을 위한 디버깅 로그 추가
        console.log('User Info:', req.user); // req.user가 올바르게 설정되었는지 확인

        return next(); // 다음 미들웨어나 요청 처리로 넘어감
    } catch (error) {
        console.error('JWT verification error:', error.message); // 에러 메시지 로깅

        if (error.name === 'TokenExpiredError') {
            // 토큰이 만료된 경우
            return res.status(419).json({
                code: 419,
                message: '토큰이 만료되었습니다.',
            });
        }

        // 토큰이 유효하지 않거나 오류 발생 시
        return res.status(401).json({
            code: 401,
            message: '유효하지 않은 토큰입니다.',
        });
    }
};
