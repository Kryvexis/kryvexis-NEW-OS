import MailosaurClient from 'mailosaur';

export function getMailClient() {
  const apiKey = process.env.MAILOSAUR_API_KEY;
  const serverId = process.env.MAILOSAUR_SERVER_ID;
  if (!apiKey || !serverId) {
    throw new Error('Missing MAILOSAUR_API_KEY or MAILOSAUR_SERVER_ID');
  }
  return { client: new MailosaurClient(apiKey), serverId };
}

export function getMailosaur() {
  return getMailClient().client;
}

export function makeTestAddress(prefix = 'test') {
  const serverId = process.env.MAILOSAUR_SERVER_ID;
  if (!serverId) {
    throw new Error('Missing MAILOSAUR_SERVER_ID');
  }
  return `${prefix}-${Date.now()}@${serverId}.mailosaur.net`;
}
