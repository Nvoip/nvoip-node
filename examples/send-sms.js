import { NvoipClient } from "../src/client.js";

const client = new NvoipClient({
  baseUrl: process.env.NVOIP_BASE_URL,
});

const oauth = await client.createAccessToken({
  numbersip: process.env.NVOIP_NUMBERSIP,
  userToken: process.env.NVOIP_USER_TOKEN,
});

const response = await client.sendSms({
  numberPhone: process.env.NVOIP_TARGET_NUMBER ?? "11999999999",
  message: process.env.NVOIP_SMS_MESSAGE ?? "Mensagem de teste Nvoip",
  accessToken: oauth.access_token,
});

console.log(JSON.stringify(response, null, 2));
