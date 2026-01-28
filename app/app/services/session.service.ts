import { SERVER_URL } from "@/enviroment";

export interface Session {
  starting: boolean;
  socket?: SessionSocket;
}

export interface SessionStartResponse {
  status: boolean;
  error?: string;
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

export interface ConnectionResponse {
  status: boolean;
  error?: "SESSION_NOT_FOUND" | "INVALID_CAPTCHA" | "INVALID_PASSWORD";
  token?: string;
}

export const SessionService = {
  async validateRecaptchaValue(recaptchaValue: string): Promise<string | null> {
    let finalValue: string | null = null;
    try {
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
    } catch (e) {}
    return finalValue;
  },

  async getSessionInfo(sessionId: string): Promise<SessionInfoResponse> {
    let finalObj: SessionInfoResponse = { status: false };
    try {
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
            return;
          }
          const websocketUrl = data["websocketUrl"];
          const identifier = data["identifier"];
          if (!websocketUrl || !identifier) {
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
        .catch(() => {});
    } catch (e) {}
    return finalObj;
  },

  async getConnectionToken(
    sessionId: string,
    compiledClientRequirements: CompiledClientRequirements,
  ): Promise<ConnectionResponse> {
    let finalObj: ConnectionResponse = { status: false };
    try {
      const response = await fetch(SERVER_URL + "/connect/" + sessionId, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(compiledClientRequirements),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        if (errorBody.error === "SESSION_NOT_FOUND") {
          finalObj.error = "SESSION_NOT_FOUND";
        } else if (errorBody.error === "INVALID_CAPTCHA") {
          finalObj.error = "INVALID_CAPTCHA";
        } else if (errorBody.error === "INVALID_PASSWORD") {
          finalObj.error = "INVALID_PASSWORD";
        }
      }

      const data = await response.json();
      const connectionToken = data.connectionToken;
      if (typeof connectionToken === "string") {
        finalObj.status = true;
        finalObj.token = connectionToken;
      }
    } catch (e) {}
    return finalObj;
  },

  async startSession(
    parameters: SessionCreationParameters,
    jwtToken: string,
  ): Promise<SessionStartResponse> {
    console.log(parameters);
    let finalObj: SessionStartResponse = { status: false };
    try {
      await fetch(SERVER_URL + "/start", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jwtToken: jwtToken,
          parameters: parameters,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (!data) {
            return;
          }
          const websocketUrl = data["websocketUrl"];
          const identifier = data["identifier"];
          if (!websocketUrl || !identifier) {
            return;
          }
          finalObj = {
            status: true,
            info: { websocketUrl: websocketUrl, identifier: identifier },
          };
        })
        .catch(() => {});
    } catch (e) {}
    return finalObj;
  },
};
