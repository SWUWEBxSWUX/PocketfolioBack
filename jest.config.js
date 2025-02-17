module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup.js"], // ✅ Jest가 실행 전에 환경 설정을 로드함
};