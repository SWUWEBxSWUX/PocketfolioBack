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
// 📌 마이페이지 개인정보 가져오기
exports.fetchMypageInfo = async (req, res) => {
  try {
    const loginUserId = req.user.id; // ✅ JWT에서 userId 가져오기

    // 사용자 정보 조회
    const user = await User.findByPk(loginUserId, {
      attributes: ["id", "name", "introduce"], // ✅ user_id 포함
    });

    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 팔로워 / 팔로잉 개수 조회
    const followerCount = await Follow.count({
      where: { user_id: loginUserId },
    });
    const followingCount = await Follow.count({
      where: { follower_id: loginUserId },
    });

    // ✅ 학력 정보 조회 (education_id 포함)
    const education = await Education.findOne({
      where: { user_id: loginUserId },
      attributes: ["education_id", "school", "status", "startDate", "endDate"], // ✅ education_id 추가
    });

    // ✅ 활동 정보 조회 (activity_id 포함)
    const activities = await Activity.findAll({
      where: { user_id: loginUserId },
      attributes: ["activity_id", "activityName", "startDate", "endDate"], // ✅ activity_id 추가
    });

    res.json({
      user_id: user.id, // ✅ 프론트엔드에서 `user_id` 사용 가능
      name: user.name,
      introduce: user.introduce,
      follower: followerCount,
      following: followingCount,
      education, // ✅ education_id 포함된 학력 정보 반환
      activities, // ✅ activity_id 포함된 활동 정보 반환
    });
  } catch (error) {
    console.error("🚨 fetchMypageInfo 오류:", error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};

// 📌 마이페이지 포트폴리오 조회
exports.fetchPortfolioInfo = async (req, res) => {
  try {
    const loginUserId = req.user.id; // ✅ JWT에서 userId 가져오기

    const portfolios = await Portfolio.findAll({
      where: { userId: loginUserId },
      attributes: ["id", "title", "coverImage", "views"],
    });

    res.json({ userId: loginUserId, portfolios });
  } catch (error) {
    console.error("🚨 fetchPortfolioInfo 오류:", error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};

// 📌 사용자가 북마크한 포트폴리오 조회
exports.fetchUserBookmarks = async (req, res) => {
  try {
    const loginUserId = req.user.id; // ✅ JWT에서 userId 가져오기

    const bookmarks = await PortfolioBookmark.findAll({
      where: { userId: loginUserId },
      attributes: ["portfolioId"],
    });

    const bookmarkedPortfolioIds = bookmarks.map((b) => b.portfolioId);

    if (bookmarkedPortfolioIds.length === 0) {
      return res.json({ userId: loginUserId, portfolios: [] });
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

    res.json({ userId: loginUserId, portfolios });
  } catch (error) {
    console.error("🚨 fetchUserBookmarks 오류:", error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};

// 📌 사용자가 좋아요한 포트폴리오 조회
exports.fetchUserLikedPortfolios = async (req, res) => {
  try {
    const loginUserId = req.user.id; // ✅ JWT에서 userId 가져오기

    const likes = await PortfolioLike.findAll({
      where: { userId: loginUserId },
      attributes: ["portfolioId"],
    });

    const likedPortfolioIds = likes.map((l) => l.portfolioId);

    if (likedPortfolioIds.length === 0) {
      return res.json({ userId: loginUserId, portfolios: [] });
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

    res.json({ userId: loginUserId, portfolios });
  } catch (error) {
    console.error("🚨 fetchUserLikedPortfolios 오류:", error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};
