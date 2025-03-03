const request = require('supertest');
const app = require('../../app');
const { generateTestToken } = require('../../utils/testUtils'); // 가짜 토큰 생성 유틸

const testToken = generateTestToken(); // 테스트용 토큰

describe('Portfolio API 테스트', () => {

  /** 🔹 포트폴리오 생성 테스트 */
  it('포트폴리오를 정상적으로 생성해야 함', async () => {
    const res = await request(app)
      .post('/api/portfolio/create')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ title: '테스트 포트폴리오', description: '설명' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('portfolioId');
  });

  /** 🔹 포트폴리오 상세 조회 테스트 */
  it('포트폴리오 상세 정보를 정상적으로 조회해야 함', async () => {
    const res = await request(app).get('/api/portfolio/1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('portfolio');
  });

  /** 🔹 포트폴리오 수정 테스트 */
  it('포트폴리오를 정상적으로 수정해야 함', async () => {
    const res = await request(app)
      .patch('/api/portfolio/1')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ title: '수정된 포트폴리오' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('포트폴리오가 수정되었습니다.');
  });

  /** 🔹 포트폴리오 삭제 테스트 */
  it('포트폴리오를 정상적으로 삭제해야 함', async () => {
    const res = await request(app)
      .delete('/api/portfolio/1')
      .set('Authorization', `Bearer ${testToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('포트폴리오가 삭제되었습니다.');
  });

  /** 🔹 포트폴리오 좋아요 테스트 */
  it('포트폴리오 좋아요를 정상적으로 추가/취소해야 함', async () => {
    const res = await request(app)
      .post('/api/portfolio/1/like')
      .set('Authorization', `Bearer ${testToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/좋아요 (추가|취소) 완료/);
  });

  /** 🔹 포트폴리오 조회수 증가 테스트 */
  it('포트폴리오 조회수를 증가시켜야 함', async () => {
    const res = await request(app).post('/api/portfolio/1/view');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('조회수가 증가했습니다.');
  });

});
