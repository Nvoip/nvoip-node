import { NvoipClient } from "../src/client.js";

const client = new NvoipClient({
  baseUrl: process.env.NVOIP_BASE_URL,
});
const oauth = await client.createClientCredentialsToken();

const response = await client.sendOtp({
  accessToken: oauth.access_token,
  payload: {
    phoneNumber: process.env.NVOIP_TARGET_NUMBER,
    methods: { sms: true },
  },
});

console.log(JSON.stringify(response, null, 2));
