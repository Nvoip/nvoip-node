import { NvoipClient } from "../src/client.js";

const client = new NvoipClient({
  baseUrl: process.env.NVOIP_BASE_URL,
});

const oauth = await client.createClientCredentialsToken();

const bodyVariables = JSON.parse(process.env.NVOIP_WA_BODY_VARIABLES ?? "[]");
const headerVariables = JSON.parse(process.env.NVOIP_WA_HEADER_VARIABLES ?? "[]");
const recipientType = process.env.NVOIP_WA_RECIPIENT_TYPE?.trim().toLowerCase();
const recipientValue = process.env.NVOIP_WA_RECIPIENT_VALUE?.trim();

const payload = {
  idTemplate: process.env.NVOIP_WA_TEMPLATE_ID,
  instance: process.env.NVOIP_WA_INSTANCE,
  language: process.env.NVOIP_WA_LANGUAGE ?? "pt_BR",
};

if (recipientType) {
  if (!["phone", "bsuid", "parent_bsuid"].includes(recipientType) || !recipientValue) {
    throw new Error("NVOIP_WA_RECIPIENT_TYPE must be phone, bsuid or parent_bsuid and requires NVOIP_WA_RECIPIENT_VALUE");
  }
  if (recipientValue.startsWith("@")) {
    throw new Error("@username is not a WhatsApp recipient; use a BSUID or parent BSUID");
  }
  if (recipientType === "phone" && !/^\+?\d{8,20}$/.test(recipientValue)) {
    throw new Error("A phone recipient must contain only an optional leading + and 8 to 20 digits");
  }
  if (recipientType !== "phone" && (/\s/.test(recipientValue) || recipientValue.length > 256)) {
    throw new Error("A BSUID must be an opaque value without whitespace (maximum 256 characters)");
  }
  payload.recipient = { type: recipientType, value: recipientValue };
} else {
  const destination = process.env.NVOIP_WA_DESTINATION ?? process.env.NVOIP_TARGET_NUMBER;
  if (!/^\+?\d{8,20}$/.test(destination ?? "")) {
    throw new Error("NVOIP_WA_DESTINATION must be a phone number; use recipient for BSUID");
  }
  payload.destination = destination;
}

if (bodyVariables.length > 0) {
  payload.bodyVariables = bodyVariables;
}

if (headerVariables.length > 0) {
  payload.headerVariables = headerVariables;
}

if ((process.env.NVOIP_WA_TO_FLOW ?? "false") === "true") {
  if (recipientType === "bsuid" || recipientType === "parent_bsuid") {
    throw new Error("WhatsApp Flow and attendance require a phone recipient");
  }
  payload.functions = { to_flow: true };
}

const response = await client.sendWhatsAppTemplate({
  accessToken: oauth.access_token,
  payload,
});

console.log(JSON.stringify(response, null, 2));
