import { NvoipClient } from "../src/client.js";

const client = new NvoipClient({
  baseUrl: process.env.NVOIP_BASE_URL,
});

const response = await client.createAccessToken({
  numbersip: process.env.NVOIP_NUMBERSIP,
  userToken: process.env.NVOIP_USER_TOKEN,
});

console.log(JSON.stringify(response, null, 2));
