export interface Session {
  active: boolean;
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
export const SessionService = {
  async connectToSession(sessionId: string): Promise<SessionConnectResponse> {
    //return {
    //  status: true,
    //  info: { websocketUrl: "https://test.com", identifier: "123" },
    ///};
    let finalObj: SessionConnectResponse | null = null;
    await fetch("http://localhost:3001/connect/" + sessionId, {
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

  async startConnection(): Promise<SessionConnectResponse> {
    //return {
    //  status: true,
    //  info: { websocketUrl: "https://test.com", identifier: "123" },
    ///};
    let finalObj: SessionConnectResponse | null = null;
    await fetch("http://localhost:3001/start/", {
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
