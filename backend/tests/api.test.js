import request from 'supertest';
import app from '../server.js';

describe('API validation', () => {
  it('rejects invalid PAN', async () => {
    const res = await request(app)
      .post('/api/validate/step2')
      .send({ panNumber: 'ABCDE12345' });
    expect(res.status).toBe(400);
  });

  it('rejects invalid Aadhaar', async () => {
    const res = await request(app)
      .post('/api/validate/step1')
      .send({ aadhaarNumber: '123', nameOnAadhaar: 'Test', mobileNumber: '9999999999' });
    expect(res.status).toBe(400);
  });
});


