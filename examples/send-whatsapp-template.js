import { NvoipClient } from "../src/client.js";

const client = new NvoipClient({
  baseUrl: process.env.NVOIP_BASE_URL,
});

const oauth = await client.createAccessToken({
  numbersip: process.env.NVOIP_NUMBERSIP,
  userToken: process.env.NVOIP_USER_TOKEN,
});

const bodyVariables = JSON.parse(process.env.NVOIP_WA_BODY_VARIABLES ?? "[]");
const headerVariables = JSON.parse(process.env.NVOIP_WA_HEADER_VARIABLES ?? "[]");

const payload = {
  idTemplate: process.env.NVOIP_WA_TEMPLATE_ID,
  destination: process.env.NVOIP_WA_DESTINATION ?? process.env.NVOIP_TARGET_NUMBER,
  instance: process.env.NVOIP_WA_INSTANCE,
  language: process.env.NVOIP_WA_LANGUAGE ?? "pt_BR",
};

if (bodyVariables.length > 0) {
  payload.bodyVariables = bodyVariables;
}

if (headerVariables.length > 0) {
  payload.headerVariables = headerVariables;
}

if ((process.env.NVOIP_WA_TO_FLOW ?? "false") === "true") {
  payload.functions = { to_flow: true };
}

const response = await client.sendWhatsAppTemplate({
  accessToken: oauth.access_token,
  payload,
});

console.log(JSON.stringify(response, null, 2));
