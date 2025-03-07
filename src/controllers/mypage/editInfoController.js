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
const axios = require("axios");

const API_KEY = process.env.CAREER_API_KEY; // 환경 변수로 API 키 관리

exports.searchUniversity = async (req, res) => {
  const { gubun, searchSchulNm } = req.query; // 학교 종류와 검색어 받기

  // 필수 입력값 검증
  if (!gubun || !searchSchulNm) {
    return res
      .status(400)
      .json({ error: "학교 종류와 검색어를 입력해주세요." });
  }

  // 유효한 학교 종류인지 확인
  const validGubunValues = [
    "elem_list",
    "midd_list",
    "high_list",
    "univ_list",
    "seet_list",
    "alte_list",
  ];
  if (!validGubunValues.includes(gubun)) {
    return res.status(400).json({ error: "올바른 학교 종류를 입력해주세요." });
  }

  // API 요청 URL (JSON 데이터로 요청)
  const url = `http://www.career.go.kr/cnet/openapi/getOpenApi.json?apiKey=${API_KEY}
&svcType=api
&svcCode=SCHOOL
&gubun=${gubun}
&searchSchulNm=${encodeURIComponent(searchSchulNm)}
&perPage=5
&thisPage=1
&contentType=json`; // 🔹 JSON 응답 받도록 설정

  try {
    const response = await axios.get(url);
    const schools = response.data.dataSearch?.content || [];

    // 검색 결과가 없을 경우
    if (schools.length === 0) {
      return res.status(404).json({ message: "검색된 학교가 없습니다." });
    }

    // 🔹 학교명과 주소만 리스트로 변환하여 반환
    const result = schools.map((school) => ({
      name: school.schoolName, // 학교명
      address: school.adres, // 주소
    }));

    res.json({ universities: result });
  } catch (error) {
    console.error("🚨 API 요청 중 오류 발생:", error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};
