//수정한 개인정보 저장
const { User, Education, Activity } = require("../../models");

exports.updateUserProfile = async (req, res) => {
  const { userId, name, introduce, education, activities } = req.body;

  try {
    let user = await User.findByPk(userId);

    // ✅ 1. 사용자 정보 추가 (새 사용자면 생성)
    if (!user) {
      user = await User.create({
        id: userId,
        name: name || null,
        introduce: introduce || null,
      });
    } else {
      // ✅ 2. 기존 사용자 정보 수정
      if (name !== undefined) user.name = name;
      if (introduce !== undefined) user.introduce = introduce;
      await user.save();
    }

    // ✅ 3. 학력 정보 추가 또는 수정 (단일 학력만 가능)
    if (education) {
      const existingEducation = await Education.findOne({
        where: { user_id: userId },
      });

      if (existingEducation) {
        // 기존 학력 수정
        await Education.update(
          {
            school: education.school,
            status: education.status,
            startDate: education.startDate,
            endDate: education.endDate,
          },
          { where: { user_id: userId } }
        );
      } else {
        // 새로운 학력 추가
        await Education.create({
          user_id: userId,
          school: education.school,
          status: education.status,
          startDate: education.startDate,
          endDate: education.endDate,
        });
      }
    }

    // ✅ 4. 활동 정보 추가 또는 수정 (여러 개 가능)
    if (activities && activities.length > 0) {
      for (const act of activities) {
        if (act.activity_id) {
          // 기존 활동 수정
          await Activity.update(
            {
              activityName: act.activityName,
              startDate: act.startDate,
              endDate: act.endDate || null,
            },
            { where: { activity_id: act.activity_id, user_id: userId } }
          );
        } else {
          // 새로운 활동 추가
          await Activity.create({
            user_id: userId,
            activityName: act.activityName,
            startDate: act.startDate,
            endDate: act.endDate || null,
          });
        }
      }
    }

    res.json({ message: "프로필이 성공적으로 추가/수정되었습니다." });
  } catch (error) {
    console.error("🚨 updateUserProfile 오류:", error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};
