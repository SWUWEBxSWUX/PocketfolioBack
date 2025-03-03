require("dotenv").config(); // 환경변수 로드
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");


// Express 앱 생성
const app = express();

// 미들웨어 설정
app.use(express.json()); // JSON 요청 처리
app.use(express.urlencoded({ extended: true })); // URL-encoded 요청 처리
app.use(cors()); // CORS 허용
app.use(helmet()); // 보안 헤더 설정
app.use(morgan("dev")); // HTTP 요청 로깅

// 라우터 설정
const routes = require("./src/routes"); // routes 폴더 내의 index.js 가져오기
app.use("/api", routes); // 모든 API 엔드포인트에 /api 프리픽스 적용

// 기본 라우트 (테스트용)
app.get("/", (req, res) => {
  res.send("Hello, Express Server is Running!");
});

module.exports = app;
