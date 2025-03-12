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

//JWT 미들웨어 추가
const jwt = require("jsonwebtoken");

const formatYear = (date, isEndDate = false) => {
  if (!date) return isEndDate ? "현재" : null;
  return new Date(date).getFullYear().toString(); // 연도만 반환
};

//활동(activity) 날짜 변환
const formatDate = (date) => {
  return date ? new Date(date).toISOString().split("T")[0] : "현재"; //YYYY-MM-DD 변환
};

exports.fetchMypageInfo = async (req, res) => {
  try {
    const loginUserId = req.user.id;

    //사용자 정보 조회
    const user = await User.findByPk(loginUserId, {
      attributes: ["id", "name", "introduce"],
    });

    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    //팔로워 / 팔로잉 개수 조회
    const followerCount = await Follow.count({
      where: { user_id: loginUserId },
    });
    const followingCount = await Follow.count({
      where: { follower_id: loginUserId },
    });

    // 학력 정보 조회 (YYYY 형식 유지)
    const education = await Education.findOne({
      where: { user_id: loginUserId },
      attributes: [
        "education_id",
        "school",
        "status",
        "startDate",
        "endDate",
        "educationType",
      ],
    });

    const formattedEducation = education
      ? {
          ...education.toJSON(),
          startDate: formatYear(education.startDate), // ✅ YYYY 형식으로 변환
          endDate: education.endDate
            ? formatYear(education.endDate, true)
            : "현재",
        }
      : null;

    // 활동 정보 조회 YYYY-MM-DD 형식
    const activities = await Activity.findAll({
      where: { user_id: loginUserId },
      attributes: ["activity_id", "activityName", "startDate", "endDate"],
    });

    const formattedActivities = activities.map((activity) => ({
      ...activity.toJSON(),
      startDate: formatDate(activity.startDate), // ✅ YYYY-MM-DD 변환
      endDate: activity.endDate ? formatDate(activity.endDate) : "현재", // ✅ null이면 "현재"
    }));

    res.json({
      user_id: user.id,
      name: user.name,
      introduce: user.introduce,
      follower: followerCount,
      following: followingCount,
      education: formattedEducation,
      activities: formattedActivities,
    });
  } catch (error) {
    console.error("🚨 fetchMypageInfo 오류:", error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};

//마이페이지 포트폴리오 조회
exports.fetchPortfolioInfo = async (req, res) => {
  try {
    const loginUserId = req.user.id; // JWT에서 userId 가져오기

    const portfolios = await Portfolio.findAll({
      where: { userId: loginUserId },
      attributes: ["id", "title", "coverImage", "views", "likesCount"],
    });

    res.json({ userId: loginUserId, portfolios });
  } catch (error) {
    console.error("fetchPortfolioInfo 오류:", error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};

// 사용자가 북마크한 포트폴리오 조회
exports.fetchUserBookmarks = async (req, res) => {
  try {
    const loginUserId = req.user.id;

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
      attributes: ["id", "title", "coverImage", "views", "likesCount"],
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "name"],
        },
      ],
    });

    res.json({ userId: loginUserId, portfolios });
  } catch (error) {
    console.error("fetchUserBookmarks 오류:", error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};

//사용자가 좋아요한 포트폴리오 조회
exports.fetchUserLikedPortfolios = async (req, res) => {
  try {
    const loginUserId = req.user.id;

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
      attributes: ["id", "title", "coverImage", "views", "likesCount"],
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "name"],
        },
      ],
    });

    for (const portfolio of portfolios) {
      const bookmarked = await PortfolioBookmark.findOne({
        where: { userId: loginUserId, portfolioId: portfolio.id },
      });

      portfolio.dataValues.isBookmarked = bookmarked ? true : false;
    }

    res.json({ userId: loginUserId, portfolios });
  } catch (error) {
    console.error("fetchUserLikedPortfolios 오류:", error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};
