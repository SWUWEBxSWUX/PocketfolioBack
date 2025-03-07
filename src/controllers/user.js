const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { sendVerificationEmail } = require('../config/email');

// 로그인
exports.login = async(req, res) => {
    const { email, password } = req.body;

    try{
        // 이메일 검증
        const user = await User.findOne({where : {email}});

        if(!user){
            return res.status(401).json({message : '존재하지 않는 사용자입니다.'});
        }

        console.log("DB에 저장된 해시 비밀번호:", user.password);  // 여기서 user가 null이면 에러 발생

        // 비밀번호 검증
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(401).json({message : '비밀번호가 일치하지 않습니다.'});
        }

        // 비밀번호가 일치하면 JWT토큰 발급
        const token = jwt.sign({id : user.id, email : user.email}, 
            process.env.JWT_SECRET, 
            {expiresIn :'12h'});

        return res.json({message : '로그인 성공', token}); // 클라이언트에게 토큰을 응답으로 전달

    }catch(error){
        console.error(error);
        return res.status(500).json({message : '서버 오류'});
    }
};

// 회원가입
exports.register = async (req, res) => {
    const { name, email, password, passwordCheck } = req.body;

    console.log("Request Body:", req.body); // 요청 데이터 확인

    // 비밀번호와 비밀번호 확인이 일치하는지 검사
    if (password !== passwordCheck) {
        return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    try {
        // 이메일 중복 확인
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "이미 가입된 이메일입니다." });
        }

        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(password, 10);

        // 사용자 계정 생성
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            verificationCode: null, // 나중에 인증 관련 필드를 업데이트할 경우 사용할 수 있음
            verificationExpiresAt: null
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
// (인증코드 전송 -> 비밀번호 재설정하도록)
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
            verificationCode: verificationCode,
            verificationExpiresAt: verificationExpiration
        });

        return res.json({ message: "비밀번호 재설정 인증 코드가 이메일로 전송되었습니다." });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "서버 오류" });
    }
};

// 비밀번호 재설정 (인증코드 검증 완료된 후 실행)
exports.resetPassword = async (req, res) => {
    const { email, newPassword, passwordCheck } = req.body;

    // 비밀번호와 비밀번호 확인이 일치하는지 검사
    if (newPassword !== passwordCheck) {
        return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    try {
        // 사용자 찾기
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(400).json({ message: "존재하지 않는 사용자입니다." });
        }

        // 인증 코드가 이미 확인된 상태인지 체크
        if (user.verificationCode !== null) {
            return res.status(400).json({ message: "인증 코드 확인이 필요합니다." });
        }

        // 새 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 비밀번호 업데이트
        await user.update({ password: hashedPassword });

        return res.json({ message: "비밀번호 재설정이 완료되었습니다." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "서버 오류" });
    }
};

exports.sendVerificationCode = async (req, res) => {
    const { email } = req.body;

    try {
        // 사용자 찾기
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: "등록되지 않은 이메일입니다." });
        }

        // 인증 코드 생성 및 이메일 전송
        const { verificationCode, verificationExpiration } = await sendVerificationEmail(email);

        // 이메일로 전송된 인증 코드와 만료 시간 업데이트
        await user.update({
            verificationCode: verificationCode,
            verificationExpiresAt: verificationExpiration
        });

        // 성공적인 처리 후, 적절한 성공 메시지를 반환합니다.
        return res.json({ message: "인증 코드가 이메일로 전송되었습니다." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "서버 오류" });
    }
};


// 인증 코드 검증
exports.verifyCode = async (req, res) => {
    const { email, verificationCode } = req.body;

    try {
        // 사용자 찾기
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: "존재하지 않는 사용자입니다." });
        }

        // 인증 코드 검증
        if (user.verificationCode !== verificationCode) {
            return res.status(400).json({ message: "인증 코드가 올바르지 않습니다." });
        }

        // 인증 코드 만료 확인
        if (new Date() > new Date(user.verificationExpiresAt)) {
            return res.status(400).json({ message: "인증 코드가 만료되었습니다." });
        }

        // 인증 성공 시, 인증 코드 무효화 (더 이상 재사용 불가)
        await user.update({
            verificationCode: null,
            verificationExpiresAt: null
        });

        return res.json({ message: "인증 코드가 확인되었습니다." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "서버 오류" });
    }
};

// 인증 코드 전송(회원가입 시)
const verificationCodes = {};  // 인증 코드 저장 (메모리)
exports.regSendVerificationCode = async (req, res) => {
    const { email } = req.body;

    try {
        // 인증 코드 생성 및 이메일 전송
        const { verificationCode, verificationExpiration } = await sendVerificationEmail(email);

        // 인증 코드와 만료 시간 메모리에 저장
        verificationCodes[email] = { code: verificationCode, expiresAt: verificationExpiration };

        return res.json({ message: "인증 코드가 이메일로 전송되었습니다." });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "서버 오류" });
    }
};


//인증 코드 검증(회원가입 시)
exports.regVerifyCode = async (req, res) => {
    const { email, verificationCode } = req.body;

    try {

        if (!email) {
            return res.status(400).json({ message: "이메일이 제공되지 않았습니다." });
        }
        // 메모리에서 인증 코드 확인
        const storedCode = verificationCodes[email]; // 메모리에 저장된 인증 코드 가져오기

        if (!storedCode) {
            return res.status(400).json({ message: "인증 코드가 존재하지 않습니다. 다시 인증 요청을 해주세요." });
        }

        // 인증 코드 검증
        if (storedCode.code !== verificationCode) {
            return res.status(400).json({ message: "인증 코드가 올바르지 않습니다." });
        }

        // 인증 코드 만료 확인
        if (new Date() > new Date(storedCode.expiresAt)) {
            return res.status(400).json({ message: "인증 코드가 만료되었습니다." });
        }

        // 인증 성공 시, 인증 코드 삭제 (더 이상 재사용 불가)
        delete verificationCodes[email];

        return res.json({ message: "인증 코드가 확인되었습니다." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "서버 오류" });
    }
};
