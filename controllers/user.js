const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { sendVerificationEmail } = require('../config/email');

// 랜덤 인증 코드 생성 (회원가입, 비밀번호 찾기) -> config/email.js로 
//const generateVerificationCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// 로그인
exports.login = async(req, res) => {
    const { email, password } = req.body;

    try{
        // 이메일 검증
        const user = await User.findOne({where : {email}});

        if(!user){
            return res.status(401).json({message : '존재하지 않는 사용자입니다.'});
        }

        // 비밀번호 검증
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(401).json({message : '비밀번호가 일치하지 않습니다.'});
        }

        // 비밀번호가 일치하면 JWT토큰 발급
        const token = jwt.sign({id : user.user_id, email : user.email}, 
            process.env.JWT_SECRET, 
            {expiresIn :'1h'});

        return res.json({message : '로그인 성공', token}); // 클라이언트에게 토큰을 응답으로 전달

    }catch(error){
        console.error(error);
        return res.status(500).json({message : '서버 오류'});
    }
};

// 회원가입
exports.register = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 이메일 중복 확인
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "이미 가입된 이메일입니다." });
        }

        // 사용자 계정 생성 (비밀번호 해싱 포함)
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            email,
            password: hashedPassword,
            verification_code: null,
            verification_expiration: null
        });

        return res.status(201).json({ message: "회원가입 성공" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "서버 오류" });
    }
};

// 로그아웃
exports.logout = async(req, res) => {
    // 클라이언트에서 토큰 삭제하면 로그아웃 처리 됨
    return res.json({message : '로그아웃 성공'});
}

// 비밀번호 찾기
exports.findPassword = async (req, res) => {
    const { email } = req.body;

    try {
        // 이메일로 사용자 찾기
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(400).json({ message: "등록되지 않은 이메일입니다." });
        }

        // 인증 코드 생성 및 이메일 전송
        const { verificationCode, verificationExpiration } = await sendVerificationEmail(email);

        // 사용자 인증 코드, 만료 시간 업데이트
        await user.update({
            verification_code: verificationCode,
            verification_expiration: verificationExpiration
        });

        return res.json({ message: "비밀번호 재설정 인증 코드가 이메일로 전송되었습니다." });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "서버 오류" });
    }
};

// 비밀번호 재설정
exports.resetPassword = async (req, res) => {
    const { email, verificationCode, newPassword } = req.body;

    // 이메일 찾기
    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(400).json({ message: "존재하지 않는 이메일입니다." });
        }

        const verificationResult = verifyCode(user, verificationCode);

        if (!verificationResult.valid) {
            return res.status(400).json({ message: verificationResult.message });
        }

        // 새 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 비밀번호 및 인증 정보 업데이트
        await user.update({
            password: hashedPassword,
            verification_code: null,
            verification_expiration: null
        });

        return res.json({ message: "비밀번호 재설정이 완료되었습니다." });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "서버 오류" });
    }
};

// 인증 코드 전송
exports.sendVerificationCode = async (req, res) => {
    const { email } = req.body;

    try {
        // 인증 코드 생성 및 이메일 전송
        const { verificationCode, verificationExpiration } = await sendVerificationEmail(email);

        // 이메일로 전송된 인증 코드와 만료 시간 저장
        const user = await User.findOne({ where: { email } });
        if (user) {
            await user.update({
                verification_code: verificationCode,
                verification_expiration: verificationExpiration
            });
            return res.json({ message: "인증 코드가 이메일로 전송되었습니다." });
        }

        return res.status(400).json({ message: "등록되지 않은 이메일입니다." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "서버 오류" });
    }
};

// 인증 코드 검증
exports.verifyCode = async (req, res) => {
    const { email, verificationCode } = req.body;

    try {
        // 이메일로 사용자 찾기
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: "등록되지 않은 이메일입니다." });
        }

        // 인증 코드 검증
        if (user.verification_code !== verificationCode) {
            return res.status(400).json({ message: "인증 코드가 올바르지 않습니다." });
        }

        // 인증 코드 만료 확인
        if (new Date() > new Date(user.verification_expiration)) {
            return res.status(400).json({ message: "인증 코드가 만료되었습니다." });
        }

        return res.json({ message: "인증 코드가 확인되었습니다." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "서버 오류" });
    }
};