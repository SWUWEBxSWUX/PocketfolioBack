const express = require("express");
const router = express.Router();
const { getCompanyList, getAffiliatedCompanies } = require("../services/getCompany");

// ✅ 법인 목록 조회 (검색어 기반)
router.get("/", async (req, res) => {
  try {
    const { query } = req.query; // 요청 파라미터에서 검색어 추출
    if (!query) {
      return res.status(400).json({ error: "검색어(query)가 필요합니다." });
    }

    const companies = await getCompanyList(query);
    res.json(companies);
  } catch (error) {
    console.error("❌ [법인 목록 조회] 오류:", error);
    res.status(500).json({ error: "법인 목록을 가져오는 중 오류 발생" });
  }
});

// ✅ 계열사 조회 (법인등록번호 기반)
router.get("/:crno/affiliates", async (req, res) => {
  try {
    const { crno } = req.params; // URL에서 법인등록번호(crno) 추출

    if (!crno) {
      return res.status(400).json({ error: "법인등록번호(crno)가 필요합니다." });
    }

    const affiliatedCompanies = await getAffiliatedCompanies(crno);
    res.json(affiliatedCompanies);
  } catch (error) {
    console.error("❌ [계열사 조회] 오류:", error);
    res.status(500).json({ error: "계열사 정보를 가져오는 중 오류 발생" });
  }
});

module.exports = router;
