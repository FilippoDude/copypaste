"use client";

import { createContext, useContext, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Session,
  SessionService,
  SessionConnectResponse,
} from "./services/session-service";
interface SessionContextInterface {
  session: Session;
  error: string | null;
  currentText: string;
  updateCurrentText: (text: string) => void;
  updateError: (error: string | null) => void;
  accessExistingSession: (sessionId: string) => void;
  startNewSession: () => void;
  exitSession: () => void;
  setNotificationRef: (fn: (text: string) => void) => void;
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
  const [currentText, setCurrentText] = useState<string>("");

  const notificationRef = useRef<(text: string) => void | null>(null);

  const setNotificationRef = (fn: (text: string) => void) => {
    notificationRef.current = fn;
  };

  const updateError = (error: null | string) => {
    setError(error);
  };

  const updateCurrentText = (text: string) => {
    setCurrentText(text);
    sendTextToSession(text);
  };

  const sendTextToSession = async (text: string) => {
    if (session.active && session.socket) {
      if (session.socket.webSocket.readyState == WebSocket.OPEN) {
        session.socket.webSocket.send(
          JSON.stringify({ type: "send", text: text }),
        );
      } else {
        console.log("Websocket connection has been already closed.");
        setSession({ active: false });
      }
    } else {
      console.log("Websocket connection not active!");
    }
  };

  const manageWebsocket = async (websocketUrl: string, identifier: string) => {
    const socket: WebSocket = new WebSocket(websocketUrl);
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
    socket.onmessage = (event: MessageEvent) => {
      const stringData: string = event.data.toString();
      console.log(stringData);
      let parsedData = null;
      try {
        parsedData = JSON.parse(stringData);
      } catch (e) {
        return;
      }
      if (!parsedData) return;

      if (
        parsedData.type &&
        parsedData.type === "msg" &&
        typeof parsedData.message === "string"
      )
        setCurrentText(parsedData.message);
      console.log(parsedData);
      if (
        parsedData.type &&
        parsedData.type === "notification" &&
        typeof parsedData.message === "string" &&
        notificationRef.current
      ) {
        console.log("TEST");
        notificationRef.current(parsedData.message);
      }
    };
    socket.onerror = () => {
      setError("Failed to connect to websocket.");
    };
  };

  const accessExistingSession = async (sessionId: string) => {
    const sessionConnectResponse: SessionConnectResponse =
      await SessionService.connectToSession(sessionId);
    if (!sessionConnectResponse.status || !sessionConnectResponse.info) {
      setError("No response from server...");
      return;
    }
    manageWebsocket(
      sessionConnectResponse.info.websocketUrl,
      sessionConnectResponse.info.identifier,
    );
  };
  const startNewSession = async () => {
    const sessionConnectResponse: SessionConnectResponse =
      await SessionService.startConnection();
    if (!sessionConnectResponse.status || !sessionConnectResponse.info) {
      setError("No response from server...");
      return;
    }
    manageWebsocket(
      sessionConnectResponse.info.websocketUrl,
      sessionConnectResponse.info.identifier,
    );
  };

  const exitSession = async () => {
    if (session.socket) session.socket.webSocket.close();
    setSession({ active: false });
    router.replace("/");
  };
  return (
    <SessionContext.Provider
      value={{
        session,
        error,
        currentText,
        updateCurrentText,
        updateError,
        accessExistingSession,
        startNewSession,
        exitSession,
        setNotificationRef,
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
