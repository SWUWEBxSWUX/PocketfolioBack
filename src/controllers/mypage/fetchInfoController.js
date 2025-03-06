const {
  User,
  Follow,
  Education,
  Activity,
  Portfolio,
  PortfolioLike,
  PortfolioBookmark,
  sequelize,
} = require("../../models");

// 🛠 JWT 미들웨어 추가
const jwt = require("jsonwebtoken");

// 📌 사용자 정보 조회 (마이페이지)
exports.fetchMypageInfo = async (req, res) => {
  try {
    // 🔹 요청 헤더에서 토큰 검증
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "인증 토큰이 필요합니다." });
    }

    const token = req.headers.authorization.replace("Bearer ", ""); // "Bearer " 제거
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // 🔹 req.user에 저장

    const { userId } = req.params;
    const loginUserId = req.user.id; // ✅ 로그인된 사용자 ID

    // 사용자 정보 조회
    const user = await User.findByPk(userId, {
      attributes: ["name", "introduce"],
    });

    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    const isMine = parseInt(userId) === loginUserId;

    // 팔로워 / 팔로잉 개수 조회
    const followerCount = await Follow.count({ where: { user_id: userId } });
    const followingCount = await Follow.count({
      where: { follower_id: userId },
    });

    // 학력 정보 조회
    const education = await Education.findAll({
      where: { user_id: userId },
      attributes: ["school", "status", "startDate", "endDate"],
    });

    // 활동 정보 조회
    const activities = await Activity.findAll({
      where: { user_id: userId },
      attributes: ["activityName", "startDate", "endDate"],
    });

    res.json({
      name: user.name,
      follower: followerCount,
      following: followingCount,
      introduce: user.introduce,
      isMine,
      education,
      activities,
    });
  } catch (error) {
    console.error("🚨 fetchMypageInfo 오류:", error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};

// 📌 마이페이지에서 포트폴리오 조회
exports.fetchPortfolioInfo = async (req, res) => {
  try {
    const { userId } = req.params;

    const portfolios = await Portfolio.findAll({
      where: { userId },
      attributes: ["id", "title", "coverImage", "views"],
    });

    res.json({ userId, portfolios });
  } catch (error) {
    console.error("🚨 fetchPortfolioInfo 오류:", error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};

// 📌 사용자가 북마크한 포트폴리오 조회
exports.fetchUserBookmarks = async (req, res) => {
  try {
    const { userId } = req.params;

    const bookmarks = await PortfolioBookmark.findAll({
      where: { userId },
      attributes: ["portfolioId"],
    });

    const bookmarkedPortfolioIds = bookmarks.map((b) => b.portfolioId);

    if (bookmarkedPortfolioIds.length === 0) {
      return res.json({ userId, portfolios: [] });
    }

    const portfolios = await Portfolio.findAll({
      where: { id: bookmarkedPortfolioIds },
      attributes: ["id", "title", "coverImage", "views"],
      include: [
        {
          model: PortfolioLike,
          attributes: [
            [
              sequelize.fn("COUNT", sequelize.col("PortfolioLikes.id")),
              "likes",
            ],
          ],
          required: false,
        },
        {
          model: User,
          as: "author",
          attributes: ["id", "name"],
        },
      ],
      group: ["Portfolio.id", "author.id"],
    });

    res.json({ userId, portfolios });
  } catch (error) {
    console.error("🚨 fetchUserBookmarks 오류:", error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};

// 📌 사용자가 좋아요한 포트폴리오 조회
exports.fetchUserLikedPortfolios = async (req, res) => {
  try {
    // 🔹 요청 헤더에서 토큰 검증
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "인증 토큰이 필요합니다." });
    }

    const token = req.headers.authorization.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    const { userId } = req.params;
    const loginUserId = req.user.id;

    const likes = await PortfolioLike.findAll({
      where: { userId },
      attributes: ["portfolioId"],
    });

    const likedPortfolioIds = likes.map((l) => l.portfolioId);

    if (likedPortfolioIds.length === 0) {
      return res.json({ userId, portfolios: [] });
    }

    const portfolios = await Portfolio.findAll({
      where: { id: likedPortfolioIds },
      attributes: ["id", "title", "coverImage", "views"],
      include: [
        {
          model: PortfolioLike,
          attributes: [
            [
              sequelize.fn("COUNT", sequelize.col("PortfolioLikes.id")),
              "likes",
            ],
          ],
          required: false,
        },
        {
          model: User,
          as: "author",
          attributes: ["id", "name"],
        },
      ],
      group: ["Portfolio.id", "author.id"],
    });

    for (const portfolio of portfolios) {
      const bookmarked = await PortfolioBookmark.findOne({
        where: { userId: loginUserId, portfolioId: portfolio.id },
      });

      portfolio.dataValues.isBookmarked = bookmarked ? true : false;
    }

    res.json({ userId, portfolios });
  } catch (error) {
    console.error("🚨 fetchUserLikedPortfolios 오류:", error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};
