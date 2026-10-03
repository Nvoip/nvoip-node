import { NvoipClient } from "../src/client.js";

const client = new NvoipClient({
  baseUrl: process.env.NVOIP_BASE_URL,
});

const response = await client.createClientCredentialsToken();

console.log(JSON.stringify(response, null, 2));
