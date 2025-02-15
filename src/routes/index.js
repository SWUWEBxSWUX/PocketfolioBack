const express = require("express");
const router = express.Router();

// user.js 라우트
const userRoutes = require("./user");

// 예제 라우트
router.get("/test", (req, res) => {
  res.json({ message: "API is working!" });
});

// routes/user
router.use("/user", userRoutes);

module.exports = router;
