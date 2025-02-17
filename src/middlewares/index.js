const jwt =  require('jsonwebtoken')

exports.verifyToken = (req, res, next) => {
    try{

        // JWT 토큰 검증 후 payload를 res.locals.decoded에 저장
        res.locals.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
        return next();

    }catch(error){
        if(error.name === 'TokenExpiredError'){
            // 토큰이 만료되었으면 419 응답
            return res.status(419).json({
                code: 419,
                message: '토큰이 만료되었습니다.',
            });
        }

        // 토큰이 유효하지 않으면 419 응답
        return res.status(401).json({
            code: 401,
            message: '유효하지 않은 토큰입니다.',
        });
    }
};

//exports.verifyToken = (req, res, next) => {
//    try {
//        // 🔹 "Bearer <TOKEN>" 형식이므로, "Bearer" 제거 후 토큰만 추출
//        const authHeader = req.headers.authorization;
//
//        if (!authHeader || !authHeader.startsWith("Bearer ")) {
//            return res.status(401).json({
//                code: 401,
//                message: "토큰이 없습니다.",
//            });
//        }
//
//        const token = authHeader.split(" ")[1]; // "Bearer" 다음에 오는 실제 토큰만 가져오기
//        res.locals.decoded = jwt.verify(token, process.env.JWT_SECRET);
//
//        return next();
//    } catch (error) {
//        if (error.name === "TokenExpiredError") {
//            return res.status(419).json({
//                code: 419,
//                message: "토큰이 만료되었습니다.",
//            });
//        }
//        return res.status(401).json({
//            code: 401,
//            message: "유효하지 않은 토큰입니다.",
//        });
//    }
//};
