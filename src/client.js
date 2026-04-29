export class NvoipClient {
  constructor({
    baseUrl = "https://api.nvoip.com.br/v2",
    oauthClientId = process.env.NVOIP_OAUTH_CLIENT_ID,
    oauthClientSecret = process.env.NVOIP_OAUTH_CLIENT_SECRET,
  } = {}) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.oauthClientId = oauthClientId;
    this.oauthClientSecret = oauthClientSecret;
  }

  static encodeBasicAuth(clientId, clientSecret) {
    return Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  }

  createAccessToken({ numbersip, userToken, oauthClientId, oauthClientSecret }) {
    const body = new URLSearchParams({
      username: numbersip,
      password: userToken,
      grant_type: "password",
    });

    return this.#request("POST", "/oauth/token", {
      headers: {
        Authorization: `Basic ${this.#resolveBasicAuth({
          oauthClientId,
          oauthClientSecret,
        })}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
  }

  refreshAccessToken({ refreshToken, oauthClientId, oauthClientSecret }) {
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    return this.#request("POST", "/oauth/token", {
      headers: {
        Authorization: `Basic ${this.#resolveBasicAuth({
          oauthClientId,
          oauthClientSecret,
        })}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
  }

  getBalance({ accessToken }) {
    return this.#request("GET", "/balance", {
      accessToken,
    });
  }

  sendSms({ numberPhone, message, flashSms = false, accessToken, napikey }) {
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

  createCall({ caller, called, accessToken }) {
    return this.#request("POST", "/calls/", {
      accessToken,
      json: {
        caller,
        called,
      },
    });
  }

  getCall({ callId, accessToken, napikey }) {
    const query = new URLSearchParams({ callId });
    if (napikey) {
      query.set("napikey", napikey);
    }

    return this.#request("GET", `/calls?${query.toString()}`, {
      accessToken,
    });
  }

  sendOtp({ payload, accessToken, napikey }) {
    return this.#request("POST", "/otp", {
      accessToken,
      napikey,
      json: payload,
    });
  }

  checkOtp({ code, key }) {
    const query = new URLSearchParams({ code, key });
    return this.#request("GET", `/check/otp?${query.toString()}`);
  }

  listWhatsAppTemplates({ accessToken }) {
    return this.#request("GET", "/wa/listTemplates", {
      accessToken,
    });
  }

  sendWhatsAppTemplate({ payload, accessToken }) {
    return this.#request("POST", "/wa/sendTemplates", {
      accessToken,
      json: payload,
    });
  }

  #resolveBasicAuth({ oauthClientId, oauthClientSecret } = {}) {
    const clientId = oauthClientId ?? this.oauthClientId;
    const clientSecret = oauthClientSecret ?? this.oauthClientSecret;
    if (clientId && clientSecret) {
      return NvoipClient.encodeBasicAuth(clientId, clientSecret);
    }

    throw new Error("Missing OAuth client credentials. Configure oauthClientId + oauthClientSecret.");
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
