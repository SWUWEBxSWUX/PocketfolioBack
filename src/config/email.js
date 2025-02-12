// SMTP (이메일 서버) 서버에 대한 환경 설정
const nodemailer = require("nodemailer");

// 메일 발송 객체 생성
const transporter = nodemailer.createTransport({
    host : 'smtp.naver.com',
    port: 587, // SMTP 포트
    secure: false,
    requireTLS: true, // TLS 사용 활성화
    auth: {
        user: process.env.EMAIL_USER, // 네이버 이메일 주소
        pass: process.env.EMAIL_PASS  // 네이버 비밀번호
    },
    tls : {
        rejectUnauthorized: false // 인증서 오류를 무시하도록
    }
});

// 랜덤 인증 코드 생성
const generateVerificationCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// 이메일 전송 함수
const sendVerificationEmail = async (to) => {
    const verificationCode = generateVerificationCode(); // 여기서 인증 코드 생성
    const verificationExpiration = new Date(Date.now() + 10 * 60 * 1000); // 10분 후 만료

    const mailOption = {
        from: process.env.EMAIL_USER, // 발신자 이메일 주소
        to, // 수신자
        subject: "인증 관련 메일",
        text: `인증 코드: ${verificationCode} \n 10분 안에 입력해주세요.`
    };

    try {
        await transporter.sendMail(mailOption);

        console.log(`이메일 전송 완료: ${to}`);
        return { verificationCode, verificationExpiration }; // 생성된 코드와 만료 시간 반환
    } catch (error) {
        console.log("이메일 전송 실패: ", error);
        throw new Error("이메일 전송 실패");
    }
};

module.exports = { sendVerificationEmail };