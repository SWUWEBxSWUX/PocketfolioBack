const request = require('supertest');
const app = require('../../app');

describe('Home API 테스트', () => {

  /** 🔹 추천 포트폴리오 조회 테스트 */
  it('추천 포트폴리오를 정상적으로 조회해야 함', async () => {
    const res = await request(app).get('/api/home/portfolios/recommended');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  /** 🔹 직군 리스트 조회 테스트 */
  it('직군 리스트를 정상적으로 조회해야 함', async () => {
    const res = await request(app).get('/api/home/jobs/categories');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('developer');
    expect(res.body.data).toHaveProperty('designer');
  });

  /** 🔹 인기 태그 조회 테스트 */
  it('인기 태그를 정상적으로 조회해야 함', async () => {
    const res = await request(app).get('/api/home/tags/popular');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

});
