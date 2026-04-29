const BASIC_AUTH = "TnZvaXBBcGlWMjpUblp2YVhCQmNHbFdNakl3TWpFPQ==";

export class NvoipClient {
  constructor({ baseUrl = "https://api.nvoip.com.br/v2" } = {}) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  async createAccessToken({ numbersip, userToken }) {
    const body = new URLSearchParams({
      username: numbersip,
      password: userToken,
      grant_type: "password",
    });

    return this.#request("POST", "/oauth/token", {
      headers: {
        Authorization: `Basic ${BASIC_AUTH}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
  }

  async refreshAccessToken({ refreshToken }) {
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    return this.#request("POST", "/oauth/token", {
      headers: {
        Authorization: `Basic ${BASIC_AUTH}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
  }

  async getBalance({ accessToken }) {
    return this.#request("GET", "/balance", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  async sendSms({ numberPhone, message, flashSms = false, accessToken, napikey }) {
    return this.#request("POST", "/sms", {
      accessToken,
      napikey,
      json: {
        numberPhone,
        message,
        flashSms,
      },
    });
  }

  async createCall({ caller, called, accessToken }) {
    return this.#request("POST", "/calls/", {
      accessToken,
      json: { caller, called },
    });
  }

  async getCall({ callId, accessToken, napikey }) {
    const query = new URLSearchParams({ callId });
    if (napikey) {
      query.set("napikey", napikey);
    }

    return this.#request("GET", `/calls?${query.toString()}`, {
      accessToken,
    });
  }

  async sendOtp({ payload, accessToken, napikey }) {
    return this.#request("POST", "/otp", {
      accessToken,
      napikey,
      json: payload,
    });
  }

  async listWhatsAppTemplates({ accessToken }) {
    return this.#request("GET", "/wa/listTemplates", {
      accessToken,
    });
  }

  async sendWhatsAppTemplate({ payload, accessToken }) {
    return this.#request("POST", "/wa/sendTemplates", {
      accessToken,
      json: payload,
    });
  }

  async #request(method, path, { headers = {}, body, json, accessToken, napikey } = {}) {
    const url = new URL(`${this.baseUrl}${path}`);
    if (napikey) {
      url.searchParams.set("napikey", napikey);
    }

    const requestHeaders = { ...headers };
    if (accessToken) {
      requestHeaders.Authorization = `Bearer ${accessToken}`;
    }

    let requestBody = body;
    if (json !== undefined) {
      requestHeaders["Content-Type"] = "application/json";
      requestBody = JSON.stringify(json);
    }

    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: requestBody,
    });

    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!response.ok) {
      const error = new Error(`Nvoip request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }
}
