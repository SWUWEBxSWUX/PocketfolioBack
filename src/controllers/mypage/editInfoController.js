//수정한 개인정보 저장
const { User, Education, Activity } = require("../models");

exports.updateUserProfile = async (req, res) => {
  const { userId, name, introduce, education, activities } = req.body;

  try {
    // 사용자 정보 수정 (존재하는 필드만 업데이트)
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    if (name !== undefined) user.name = name;
    if (introduce !== undefined) user.introduce = introduce;
    await user.save();

    // 학력 수정 또는 추가
    if (education && education.length > 0) {
      for (const edu of education) {
        if (edu.education_id) {
          // 기존 데이터 수정
          await Education.update(
            {
              school: edu.school,
              status: edu.status,
              startDate: edu.startDate,
              endDate: edu.endDate,
            },
            { where: { education_id: edu.education_id, user_id: userId } }
          );
        } else {
          // 새로운 데이터 추가
          await Education.create({
            user_id: userId,
            school: edu.school,
            status: edu.status,
            startDate: edu.startDate,
            endDate: edu.endDate,
          });
        }
      }
    }

    // 활동 수정 또는 추가
    if (activities && activities.length > 0) {
      for (const act of activities) {
        if (act.activity_id) {
          // 기존 데이터 수정
          await Activity.update(
            {
              activityName: act.activityName,
              startDate: act.startDate,
              endDate: act.endDate,
            },
            { where: { activity_id: act.activity_id, user_id: userId } }
          );
        } else {
          // 새로운 데이터 추가
          await Activity.create({
            user_id: userId,
            activityName: act.activityName,
            startDate: act.startDate,
            endDate: act.endDate,
          });
        }
      }
    }

    res.json({ message: "프로필이 성공적으로 수정되었습니다." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};
