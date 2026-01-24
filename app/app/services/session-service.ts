import { SERVER_URL } from "@/enviroment";

export interface Session {
  socket?: SessionSocket;
}
export interface SessionConnectResponse {
  status: boolean;
  info?: SessionSocketInfo;
}

export interface SessionSocketInfo {
  websocketUrl: string;
  identifier: string;
}

export interface SessionSocket {
  webSocket: WebSocket;
  socketInfo: SessionSocketInfo;
}

export interface SessionCreationParameters {
  requireCaptcha: boolean;
  requirePassword: string;
}

export const SessionService = {
  async validateRecaptchaValue(recaptchaValue: string): Promise<string | null> {
    let finalValue: string | null = null;
    await fetch(SERVER_URL + "/verify", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ recaptchaValue: recaptchaValue }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data) {
          return;
        }
        const jwtToken = data.jwtToken;
        if (typeof jwtToken === "string") {
          finalValue = jwtToken;
        }
      });
    return finalValue;
  },

  async connectToSession(sessionId: string): Promise<SessionConnectResponse> {
    //return {
    //  status: true,
    //  info: { websocketUrl: "https://test.com", identifier: "123" },
    ///};
    let finalObj: SessionConnectResponse | null = null;
    await fetch(SERVER_URL + "/connect/" + sessionId, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data) {
          finalObj = { status: false };
          return;
        }
        const websocketUrl = data["websocketUrl"];
        const identifier = data["identifier"];
        if (!websocketUrl || !identifier) {
          finalObj = { status: false };
          return;
        }
        finalObj = {
          status: true,
          info: { websocketUrl: websocketUrl, identifier: identifier },
        };
      })
      .catch(() => {
        finalObj = { status: false };
      });
    if (!finalObj) return { status: false };
    return finalObj;
  },

  async startConnection(
    parameters: SessionCreationParameters,
  ): Promise<SessionConnectResponse> {
    //return {
    //  status: true,
    //  info: { websocketUrl: "https://test.com", identifier: "123" },
    ///};

    console.log(parameters); // implement parameters on backend
    let finalObj: SessionConnectResponse | null = null;
    await fetch(SERVER_URL + "/start", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data) {
          finalObj = { status: false };
          return;
        }
        const websocketUrl = data["websocketUrl"];
        const identifier = data["identifier"];
        if (!websocketUrl || !identifier) {
          finalObj = { status: false };
          return;
        }
        finalObj = {
          status: true,
          info: { websocketUrl: websocketUrl, identifier: identifier },
        };
      })
      .catch(() => {
        finalObj = { status: false };
      });
    if (!finalObj) return { status: false };
    return finalObj;
  },
};
