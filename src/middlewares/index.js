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