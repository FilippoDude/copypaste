import { SERVER_URL } from "@/enviroment";

export interface Session {
  starting: boolean;
  socket?: SessionSocket;
}

export interface SessionStartResponse {
  status: boolean;
  info?: SessionSocketInfo;
}
export interface SessionInfoResponse {
  status: boolean;
  info?: SessionSocketInfo;
  clientRequirements?: ClientRequirements;
}

export interface ClientRequirements {
  captchaRequired: boolean;
  passwordRequired: boolean;
}

export interface CompiledClientRequirements {
  recaptchaValue?: string;
  password?: string;
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

  async getSessionInfo(sessionId: string): Promise<SessionInfoResponse> {
    //return {
    //  status: true,
    //  info: { websocketUrl: "https://test.com", identifier: "123" },
    ///};
    let finalObj: SessionInfoResponse | null = null;
    await fetch(SERVER_URL + "/getInfo/" + sessionId, {
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

        const clientRequirements = data["clientRequirements"];
        let passwordRequired = clientRequirements["passwordRequired"];
        console.log(passwordRequired);
        let captchaRequired = clientRequirements["captchaRequired"];
        console.log(captchaRequired);
        if (typeof passwordRequired != "boolean") {
          passwordRequired = false;
        }

        if (typeof captchaRequired != "boolean") {
          captchaRequired = false;
        }

        finalObj = {
          status: true,
          info: {
            websocketUrl: websocketUrl,
            identifier: identifier,
          },
          clientRequirements: {
            passwordRequired: passwordRequired,
            captchaRequired: captchaRequired,
          },
        };
      })
      .catch(() => {
        finalObj = { status: false };
      });
    if (!finalObj) return { status: false };
    return finalObj;
  },

  async getConnectionToken(
    sessionId: string,
    compiledClientRequirements: CompiledClientRequirements,
  ): Promise<string | null> {
    let token: string | null = null;
    await fetch(SERVER_URL + "/connect/" + sessionId, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(compiledClientRequirements),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data) {
          return;
        }
        const connectionToken = data.connectionToken;
        if (typeof connectionToken === "string") {
          token = connectionToken;
        }
      });
    return token;
  },

  async startSession(
    parameters: SessionCreationParameters,
    jwtToken: string,
  ): Promise<SessionStartResponse> {
    console.log(parameters); // implement parameters on backend
    let finalObj: SessionStartResponse | null = null;
    await fetch(SERVER_URL + "/start", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ jwtToken: jwtToken }),
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
