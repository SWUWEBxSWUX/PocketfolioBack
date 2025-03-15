const axios = require("axios");

exports.getCompanyList = async (query) => {
  const serviceKey = process.env.DATA_GO_KR_API_KEY;
  const apiUrl =
    "http://apis.data.go.kr/1160100/service/GetCorpBasicInfoService_V2/getCorpOutline_V2";

  const params = {
    pageNo: 1,
    numOfRows: 10, // 10개 법인만 조회
    resultType: "json",
    corpNm: query, // 검색어 사용
    serviceKey: serviceKey,
  };

  console.log("🔹 [법인 목록 조회] 요청 URL:", apiUrl, params);

  try {
    const response = await axios.get(apiUrl, { params });

    console.log("🔹 [법인 목록 조회] API 응답:", JSON.stringify(response.data, null, 2));

    let companies = [];
    if (
      response.data &&
      response.data.response &&
      response.data.response.body &&
      response.data.response.body.items &&
      response.data.response.body.items.item
    ) {
      companies = response.data.response.body.items.item.map((item) => ({
        crno: item.crno, // 법인등록번호
        corpNm: item.corpNm, // 법인명
        enpPbanCmpyNm: item.enpPbanCmpyNm || null, // 공시 회사명
        enpRprFnm: item.enpRprFnm || null, // 대표자 성명
        enpBsadr: item.enpBsadr || null, // 본사 주소
      }));
    }

    return companies; // 프론트로 법인 목록 반환
  } catch (error) {
    console.error("❌ [법인 목록 조회] API 요청 실패:", error);
    return [];
  }
};

exports.getAffiliatedCompanies = async (crno) => {
  const serviceKey = process.env.DATA_GO_KR_API_KEY;
  const apiUrl =
    "http://apis.data.go.kr/1160100/service/GetCorpBasicInfoService_V2/getAffiliate_V2";

  const params = {
    pageNo: 1,
    numOfRows: 10,
    resultType: "json",
    crno: crno, // 선택된 법인등록번호 사용
    serviceKey: serviceKey,
  };

  console.log("🔹 [계열사 조회] 요청 URL:", apiUrl, params);

  try {
    const response = await axios.get(apiUrl, { params });

    console.log("🔹 [계열사 조회] API 응답:", JSON.stringify(response.data, null, 2));

    let affiliatedCompanies = [];
    if (
      response.data &&
      response.data.response &&
      response.data.response.body &&
      response.data.response.body.items &&
      response.data.response.body.items.item
    ) {
      affiliatedCompanies = response.data.response.body.items.item.map((item) => ({
        afilCmpyNm: item.afilCmpyNm, // 계열회사명
        afilCmpyCrno: item.afilCmpyCrno, // 계열회사 법인등록번호
        lstgYn: item.lstgYn || "비상장", // 상장 여부
      }));
    }

    return affiliatedCompanies; // 프론트로 계열사 목록 반환
  } catch (error) {
    console.error("❌ [계열사 조회] API 요청 실패:", error);
    return [];
  }
};
