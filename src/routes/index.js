const express = require("express");
const router = express.Router();

// 예제 라우트
router.get("/test", (req, res) => {
  res.json({ message: "API is working!" });
});

module.exports = router;
