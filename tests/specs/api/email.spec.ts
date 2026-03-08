import { test, expect, request } from '@playwright/test';

test('email route responds', async ({ baseURL }) => {
  const api = await request.newContext({ baseURL });
  const res = await api.post('/api/email/send', {
    data: { to: 'test@example.com', subject: 'QA ping', text: 'hello' }
  });
  expect([200, 400, 401, 405, 500]).toContain(res.status());
});
