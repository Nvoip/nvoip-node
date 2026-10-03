export class NvoipClient {
  constructor({
    baseUrl = "https://api.nvoip.com.br/v3",
    oauthClientId = process.env.NVOIP_OAUTH_CLIENT_ID,
    oauthClientSecret = process.env.NVOIP_OAUTH_CLIENT_SECRET,
  } = {}) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.oauthClientId = oauthClientId;
    this.oauthClientSecret = oauthClientSecret;
  }

  static encodeBasicAuth(clientId, clientSecret) {
    return Buffer.from(`${encodeURIComponent(clientId)}:${encodeURIComponent(clientSecret)}`).toString("base64");
  }

  createClientCredentialsToken({ oauthClientId, oauthClientSecret } = {}) {
    const body = new URLSearchParams({
      grant_type: "client_credentials",
    });

    return this.#request("POST", "https://api.nvoip.com.br/auth/oauth2/token", {
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

    return this.#request("POST", "https://api.nvoip.com.br/auth/oauth2/token", {
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

  sendSms({ numberPhone, message, flashSms = false, accessToken }) {
    return this.#request("POST", "/sms", {
      accessToken,
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

  getCall({ callId, accessToken }) {
    const query = new URLSearchParams({ callId });

    return this.#request("GET", `/calls?${query.toString()}`, {
      accessToken,
    });
  }

  sendOtp({ payload, accessToken }) {
    return this.#request("POST", "/otp", {
      accessToken,
      json: payload,
    });
  }

  checkOtp({ code, key, accessToken }) {
    const query = new URLSearchParams({ code, key });
    return this.#request("GET", `/check/otp?${query.toString()}`, { accessToken });
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

  async #request(method, path, { headers = {}, body, json, accessToken } = {}) {
    const url = new URL(path.startsWith("http") ? path : `${this.baseUrl}${path}`);

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
