const {
  User,
  Follow,
  Education,
  Activity,
  Portfolio,
  PortfolioLike,
  PortfolioBookmark,
} = require("../models");

exports.fetchMypageInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    const loginUserId = req.user.id;

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

    // 학력 정보 조회 (학교이름, 상태, 입학일, 졸업일)
    const education = await Education.findAll({
      where: { user_id: userId },
      attributes: ["school", "status", "startDate", "endDate"],
    });

    // 활동 정보 조회 (활동명, 시작일, 종료일)
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
      education, // 학력 정보 추가
      activities, // 활동 정보 추가
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};

//2. mypage에서 포트폴리오 불러오기

exports.fetchUserBookmarks = async (req, res) => {
  try {
    const { userId } = req.params; // 프론트에서 요청한 userId

    // 사용자가 북마크한 포트폴리오 ID 목록 조회
    const bookmarks = await PortfolioBookmark.findAll({
      where: { userId },
      attributes: ["portfolioId"],
    });

    const bookmarkedPortfolioIds = bookmarks.map((b) => b.portfolioId);

    if (bookmarkedPortfolioIds.length === 0) {
      return res.json({ userId, portfolios: [] });
    }

    // 북마크한 포트폴리오 목록 조회 (제목, 커버 이미지, 조회수, 좋아요 개수, 작성자 정보 포함)
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
          as: "author", // 포트폴리오 작성자
          attributes: ["id", "name"],
        },
      ],
      group: ["Portfolio.id", "author.id"],
    });

    res.json({
      userId,
      portfolios,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};

const {
  Portfolio,
  PortfolioLike,
  PortfolioBookmark,
  User,
  sequelize,
} = require("../models");

exports.fetchUserLikedPortfolios = async (req, res) => {
  try {
    const { userId } = req.params; // 프론트에서 요청한 userId
    const loginUserId = req.user.id; // 현재 로그인한 사용자 ID (JWT 인증된 유저)

    // 사용자가 좋아요한 포트폴리오 ID 목록 조회
    const likes = await PortfolioLike.findAll({
      where: { userId },
      attributes: ["portfolioId"],
    });

    const likedPortfolioIds = likes.map((l) => l.portfolioId);

    if (likedPortfolioIds.length === 0) {
      return res.json({ userId, portfolios: [] });
    }

    // 좋아요한 포트폴리오 목록 조회 (북마크 여부, 제목, 커버 이미지, 조회수, 좋아요 개수, 작성자 정보 포함)
    const portfolios = await Portfolio.findAll({
      where: { id: likedPortfolioIds },
      attributes: ["id", "title", "coverImage", "views"],
      include: [
        // 좋아요 개수 조회
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
        // 포트폴리오 작성자 정보
        {
          model: User,
          as: "author",
          attributes: ["id", "name"],
        },
      ],
      group: ["Portfolio.id", "author.id"],
    });

    // 현재 사용자가 해당 포트폴리오를 북마크했는지 여부 확인
    for (const portfolio of portfolios) {
      const bookmarked = await PortfolioBookmark.findOne({
        where: { userId: loginUserId, portfolioId: portfolio.id },
      });

      portfolio.dataValues.isBookmarked = bookmarked ? true : false;
    }

    res.json({
      userId,
      portfolios,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};

//3. 좋아요 한 포트폴리오 불러오기
exports.fetchUserLikedPortfolios = async (req, res) => {
  try {
    const { userId } = req.params; // 프론트에서 요청한 userId
    const loginUserId = req.user.id; // 현재 로그인한 사용자 ID (JWT 인증된 유저)

    // 사용자가 좋아요한 포트폴리오 ID 목록 조회
    const likes = await PortfolioLike.findAll({
      where: { userId },
      attributes: ["portfolioId"],
    });

    const likedPortfolioIds = likes.map((l) => l.portfolioId);

    if (likedPortfolioIds.length === 0) {
      return res.json({ userId, portfolios: [] });
    }

    // 좋아요한 포트폴리오 목록 조회 (북마크 여부, 제목, 커버 이미지, 조회수, 좋아요 개수, 작성자 정보 포함)
    const portfolios = await Portfolio.findAll({
      where: { id: likedPortfolioIds },
      attributes: ["id", "title", "coverImage", "views"],
      include: [
        // 좋아요 개수 조회
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
        // 포트폴리오 작성자 정보
        {
          model: User,
          as: "author",
          attributes: ["id", "name"],
        },
      ],
      group: ["Portfolio.id", "author.id"],
    });

    // 현재 사용자가 해당 포트폴리오를 북마크했는지 여부 확인
    for (const portfolio of portfolios) {
      const bookmarked = await PortfolioBookmark.findOne({
        where: { userId: loginUserId, portfolioId: portfolio.id },
      });

      portfolio.dataValues.isBookmarked = bookmarked ? true : false;
    }

    res.json({
      userId,
      portfolios,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};
