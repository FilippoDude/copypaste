"use client";

import { createContext, useContext, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Session,
  SessionService,
  SessionConnectResponse,
} from "./services/session-service";
interface SessionContextInterface {
  session: Session;
  error: string | null;
  updateError: (error: string | null) => void;
  accessExistingSession: (sessionId: string) => void;
  sendPaste: () => Promise<void>;
  startNewSession: () => void;
}

const SessionContext = createContext<SessionContextInterface | null>(null);

export function SessionContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [session, setSession] = useState<Session>({
    active: false,
  });
  const [error, setError] = useState<string | null>(null);

  const updateError = (error: null | string) => {
    setError(error);
  };

  const sendPaste = async () => {
    if (session.active && session.socket) {
      if (session.socket.webSocket.readyState == WebSocket.OPEN) {
        session.socket.webSocket.send("TEST MESSAGE");
      } else {
        console.log("Websocket connection has been already closed.");
        setSession({ active: false });
      }
    } else {
      console.log("Websocket connection not active!");
    }
  };

  const accessExistingSession = async (sessionId: string) => {
    const sessionConnectResponse: SessionConnectResponse =
      await SessionService.connectToSession(sessionId);
    if (!sessionConnectResponse.status || !sessionConnectResponse.info) {
      setError("No response from server...");
      return;
    }

    const socket: WebSocket = new WebSocket(
      sessionConnectResponse.info.websocketUrl,
    );
    const identifier = sessionConnectResponse.info.identifier;
    const websocketUrl = sessionConnectResponse.info.websocketUrl;
    socket.onopen = () => {
      console.log("Websocket connection opened.");
      setSession((currentSession) => {
        currentSession.active = true;
        currentSession.socket = {
          webSocket: socket,
          socketInfo: { identifier: identifier, websocketUrl: websocketUrl },
        };
        return currentSession;
      });
      router.replace("/pages/session/" + identifier);
    };
    socket.onclose = () => {
      console.log("Websocket connection closed.");
      setSession({ active: false });
      router.replace("/");
    };
    socket.onerror = () => {
      setError("Failed to connect to websocket.");
    };
  };
  const startNewSession = async () => {
    const sessionConnectResponse: SessionConnectResponse =
      await SessionService.startConnection();
    if (!sessionConnectResponse.status || !sessionConnectResponse.info) {
      setError("No response from server...");
      return;
    }

    const socket: WebSocket = new WebSocket(
      sessionConnectResponse.info.websocketUrl,
    );
    const identifier = sessionConnectResponse.info.identifier;
    const websocketUrl = sessionConnectResponse.info.websocketUrl;
    socket.onopen = () => {
      console.log("Websocket connection opened.");
      setSession((currentSession) => {
        currentSession.active = true;
        currentSession.socket = {
          webSocket: socket,
          socketInfo: { identifier: identifier, websocketUrl: websocketUrl },
        };
        return currentSession;
      });
      router.replace("/pages/session/" + identifier);
    };
    socket.onclose = () => {
      console.log("Websocket connection closed.");
      setSession({ active: false });
      router.replace("/");
    };
    socket.onerror = () => {
      setError("Failed to connect to websocket.");
    };
  };
  return (
    <SessionContext.Provider
      value={{
        session,
        error,
        updateError,
        accessExistingSession,
        startNewSession,
        sendPaste,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSessionContext(): SessionContextInterface {
  const context = useContext(SessionContext);
  if (context == null) {
    throw Error("Context failed!");
  }
  return context;
}
