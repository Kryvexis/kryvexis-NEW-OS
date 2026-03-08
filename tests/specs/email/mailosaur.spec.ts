import { test, expect } from '@playwright/test';
import { getMailClient, makeTestAddress } from '../../helpers/mail';

test.skip(!process.env.MAILOSAUR_API_KEY || !process.env.MAILOSAUR_SERVER_ID, 'Mailosaur not configured');

test('mailosaur config is usable', async () => {
  const { client, serverId } = getMailClient();

  const server = await client.servers.get(serverId);
  expect(server.id).toBe(serverId);

  const address = makeTestAddress('smoke');
  expect(address).toContain(`@${serverId}.mailosaur.net`);
});
