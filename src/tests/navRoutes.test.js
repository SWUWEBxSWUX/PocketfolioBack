const request = require('supertest');
const app = require('../../app');

describe('Navbar API 테스트', () => {

  /** 🔹 인증 상태 조회 테스트 */
  it('인증 상태를 정상적으로 조회해야 함', async () => {
    const res = await request(app).get('/api/nav/auth/status');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('authenticated');
  });

  /** 🔹 검색 기능 테스트 */
  it('검색 기능이 정상적으로 동작해야 함', async () => {
    const res = await request(app).get('/api/nav/search').query({ q: 'test' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('results');
    expect(Array.isArray(res.body.results)).toBe(true);
  });

  /** 🔹 알림 리스트 조회 테스트 */
  it('알림 리스트를 정상적으로 조회해야 함', async () => {
    const res = await request(app).get('/api/nav/notifications');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('notifications');
    expect(Array.isArray(res.body.notifications)).toBe(true);
  });

});
