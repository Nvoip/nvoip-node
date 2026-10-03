import { NvoipClient } from "../src/client.js";

const client = new NvoipClient({
  baseUrl: process.env.NVOIP_BASE_URL,
});
const oauth = await client.createClientCredentialsToken();

const response = await client.checkOtp({
  code: process.env.NVOIP_OTP_CODE,
  key: process.env.NVOIP_OTP_KEY,
  accessToken: oauth.access_token,
});

console.log(JSON.stringify(response, null, 2));
