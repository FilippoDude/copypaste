"use client";

import { createContext, useContext, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Session,
  SessionService,
  SessionConnectResponse,
} from "./services/session-service";
import { CopypasteHelper, TextUpdate } from "./helpers/copypaste-helper";
interface SessionContextInterface {
  error: string | null;
  updateError: (error: string | null) => void;
  sessionData: {
    currentText: string;
    updateCurrentText: (text: string) => void;
    startTime: number;
  };
  session: Session;
  sessionManagement: {
    accessExistingSession: (sessionId: string) => void;
    startNewSession: () => void;
    exitSession: () => void;
  };
  setNotificationRef: (fn: (text: string) => void) => void;
  sendNotificationFromLocal: (text: string) => void;
  recaptchaValue: string | null;
  changeRecaptchaValue: (text: string | null) => void;
}

const SessionContext = createContext<SessionContextInterface | null>(null);

export function SessionContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [session, setSession] = useState<Session>({});
  const [error, setError] = useState<string | null>(null);
  const [currentText, setCurrentText] = useState<string>("");
  const [startTime, setStartTime] = useState(0);
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null);

  const notificationRef = useRef<(text: string) => void | null>(null);

  const changeRecaptchaValue = (value: string | null) => {
    setRecaptchaValue(value);
  };

  const setNotificationRef = (fn: (text: string) => void) => {
    notificationRef.current = fn;
  };

  const updateError = (error: null | string) => {
    setError(error);
  };

  const updateCurrentText = (text: string) => {
    setCurrentText(text);
    const textUpdate: TextUpdate | null = CopypasteHelper.getTextDifferences(
      text,
      currentText,
    );
    if (textUpdate) sendTextToSession(textUpdate);
  };
  const sendNotificationFromLocal = (text: string) => {
    if (notificationRef.current) notificationRef.current(text);
  };
  const closeConnection = () => {
    setCurrentText("");
    if (session.socket) session.socket.webSocket.close();
    setStartTime(0);
    setSession({});
    setRecaptchaValue(null);
    router.replace("/");
  };
  const sendTextToSession = async (textUpdate: TextUpdate) => {
    if (session.socket) {
      if (session.socket.webSocket.readyState == WebSocket.OPEN) {
        session.socket.webSocket.send(
          JSON.stringify({ type: "sendText", textUpdate: textUpdate }),
        );
      } else {
        console.log("Websocket connection has been already closed.");
        closeConnection();
      }
    } else {
      console.log("Websocket connection not active!");
    }
  };

  const manageWebsocket = async (websocketUrl: string, identifier: string) => {
    let jwtToken: string | null = null;
    if (recaptchaValue) {
      jwtToken = await SessionService.validateRecaptchaValue(recaptchaValue);
    }

    const socket: WebSocket = new WebSocket(websocketUrl);
    socket.onopen = () => {
      console.log("Websocket connection opened.");
      socket.send(JSON.stringify({ type: "verification", text: jwtToken }));
      setSession((currentSession) => {
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
      closeConnection();
    };
    socket.onmessage = (event: MessageEvent) => {
      const stringData: string = event.data.toString();
      //console.log(stringData);
      let parsedData = null;
      try {
        parsedData = JSON.parse(stringData);
      } catch (e) {
        return;
      }
      if (!parsedData) return;

      if (
        parsedData.type &&
        parsedData.type === "returnText" &&
        typeof parsedData.textUpdate.index === "number" &&
        typeof parsedData.textUpdate.deleted === "string" &&
        typeof parsedData.textUpdate.added === "string"
      )
        setCurrentText((oldText) => {
          return CopypasteHelper.getNewTextFromUpdate(
            oldText,
            parsedData.textUpdate,
          );
        });

      if (
        parsedData.type &&
        parsedData.type === "notification" &&
        typeof parsedData.message === "string" &&
        notificationRef.current
      ) {
        notificationRef.current(parsedData.message);
      }

      if (
        parsedData.type &&
        parsedData.type === "sync" &&
        typeof parsedData.message === "string" &&
        typeof parsedData.startTime === "number"
      ) {
        setCurrentText(parsedData.message);
        setStartTime(parsedData.startTime);
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
    closeConnection();
  };

  return (
    <SessionContext.Provider
      value={{
        error,
        sessionData: {
          currentText,
          updateCurrentText,
          startTime,
        },
        updateError,
        session,
        sessionManagement: {
          accessExistingSession,
          startNewSession,
          exitSession,
        },
        setNotificationRef,
        sendNotificationFromLocal,
        recaptchaValue,
        changeRecaptchaValue,
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
