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
    return {
      status: true,
      info: { websocketUrl: "https://test.com", identifier: "123" },
    };

    /*const request = fetch("", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionId: sessionId,
      }),
    })
      .then((response) => {

      })
      .catch((error) => {
        return { status: false };
      });
    return { status: false };*/
  },
};
