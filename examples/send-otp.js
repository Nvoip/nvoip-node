import { NvoipClient } from "../src/client.js";

const client = new NvoipClient({
  baseUrl: process.env.NVOIP_BASE_URL,
});

const response = await client.sendOtp({
  napikey: process.env.NVOIP_NAPIKEY,
  payload: {
    sms: process.env.NVOIP_TARGET_NUMBER ?? "11999999999",
  },
});

console.log(JSON.stringify(response, null, 2));
