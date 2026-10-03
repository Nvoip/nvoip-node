import test from 'node:test';
import assert from 'node:assert/strict';
import { NvoipClient } from '../src/client.js';

const id = 'client: &+á';
const credential = 'dummy: &+é';
const formValue = value => new URLSearchParams({ v: value }).toString().slice(2);

async function recorded(action, response = {}, status = 200) {
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url: String(url), options });
    return new Response(JSON.stringify(response), { status });
  };
  try { await action(); } finally { globalThis.fetch = original; }
  return calls[0];
}

test('client credentials use central form endpoint and correctly encoded Basic credentials', async () => {
  const client = new NvoipClient({ oauthClientId: id, oauthClientSecret: credential });
  const sent = await recorded(() => client.createClientCredentialsToken());
  assert.equal(sent.url, 'https://api.nvoip.com.br/auth/oauth2/token');
  assert.equal(sent.options.method, 'POST');
  assert.equal(sent.options.headers['Content-Type'], 'application/x-www-form-urlencoded');
  assert.equal(Buffer.from(sent.options.headers.Authorization.slice(6), 'base64').toString(), `${formValue(id)}:${formValue(credential)}`);
  assert.equal(new URLSearchParams(sent.options.body).get('grant_type'), 'client_credentials');
});

test('refresh uses central endpoint and round trips special characters', async () => {
  const client = new NvoipClient({ oauthClientId: id, oauthClientSecret: credential });
  const fixture = 'dummy&+é';
  const sent = await recorded(() => client.refreshAccessToken({
    refreshToken: fixture,
  }));
  assert.equal(sent.url, 'https://api.nvoip.com.br/auth/oauth2/token');
  assert.equal(new URLSearchParams(sent.options.body).get('refresh_token'), fixture);
});

test('balance and OTP confirmation require Bearer and preserve query encoding', async () => {
  const client = new NvoipClient();
  const balance = await recorded(() => client.getBalance({
    accessToken: 'dummy',
  }));
  assert.equal(balance.url, 'https://api.nvoip.com.br/v3/balance');
  assert.equal(balance.options.headers.Authorization, 'Bearer dummy');
  const otp = await recorded(() => client.checkOtp({
    code: '001122',
    key: 'key&+á',
    accessToken: 'dummy',
  }));
  assert.equal(new URL(otp.url).searchParams.get('key'), 'key&+á');
  assert.equal(new URL(otp.url).searchParams.has('napikey'), false);
  assert.equal(otp.options.headers.Authorization, 'Bearer dummy');
});

test('send OTP serializes the v3 contract and controlled HTTP errors retain status', async () => {
  const client = new NvoipClient();
  const payload = { phoneNumber: '11999990000', methods: { sms: true } };
  const sent = await recorded(() => client.sendOtp({
    payload,
    accessToken: 'dummy',
  }));
  assert.deepEqual(JSON.parse(sent.options.body), payload);
  await assert.rejects(recorded(() => client.getBalance({
    accessToken: 'dummy',
  }), { error: 'denied' }, 403), err => err.status === 403);
  await assert.rejects(recorded(() => new NvoipClient({ oauthClientId: '', oauthClientSecret: '' }).createClientCredentialsToken()), /Missing OAuth/);
});
