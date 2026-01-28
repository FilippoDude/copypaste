"use client";

import { createContext, useContext, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Session,
  SessionService,
  SessionCreationParameters,
  SessionStartResponse,
  SessionInfoResponse,
} from "./services/session.service";
import { CopypasteHelper, TextUpdate } from "./helpers/copypaste.helper";
interface SessionContextInterface {
  error: string | null;
  updateError: (error: string | null) => void;
  sessionData: {
    currentText: string;
    updateCurrentText: (text: string) => void;
    startTime: number;
    terminationTime: number;
  };
  session: Session;
  sessionManagement: {
    openSocketToExistingSession: (socketId: string, token?: string) => void;
    startNewSession: (
      parameters: SessionCreationParameters,
      recaptchaValue: string,
    ) => void;
    exitSession: () => void;
  };
  setNotificationRef: (fn: (text: string) => void) => void;
  sendNotificationFromLocal: (text: string) => void;
}

const SessionContext = createContext<SessionContextInterface | null>(null);

export function SessionContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [session, setSession] = useState<Session>({ starting: false });
  const [error, setError] = useState<string | null>(null);
  const [currentText, setCurrentText] = useState<string>("");
  const [startTime, setStartTime] = useState(0);
  const [terminationTime, setTerminationTime] = useState(0);

  const notificationRef = useRef<(text: string) => void | null>(null);

  const setNotificationRef = (fn: (text: string) => void) => {
    notificationRef.current = fn;
  };

  const updateError = (error: any) => {
    setError(error.toString());
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
    setSession({ starting: false });
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

  const manageWebsocket = async (
    websocketUrl: string,
    identifier: string,
    jwtToken?: string,
  ) => {
    const socket: WebSocket = new WebSocket(websocketUrl);
    setSession((currentSession) => {
      currentSession.socket = {
        webSocket: socket,
        socketInfo: { identifier: identifier, websocketUrl: websocketUrl },
      };
      return currentSession;
    });
    router.replace("/pages/session/" + identifier);
    socket.onopen = () => {
      console.log("Websocket connection opened.");
      socket.send(JSON.stringify({ type: "verification", text: jwtToken }));
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
      ) {
        console.log("FAULTY");
        console.log(parsedData.textUpdate);
        setCurrentText((oldText) => {
          return CopypasteHelper.getNewTextFromUpdate(
            oldText,
            parsedData.textUpdate,
          );
        });
      }

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
        setTerminationTime(parsedData.terminationTime);
      }
    };
    socket.onerror = () => {
      updateError("Failed to connect to websocket.");
    };
  };

  const openSocketToExistingSession = async (
    sessionId: string,
    token?: string,
  ) => {
    session.starting = true;
    try {
      const sessionInfoResponse: SessionInfoResponse =
        await SessionService.getSessionInfo(sessionId);
      if (!sessionInfoResponse.status || !sessionInfoResponse.info) {
        throw new Error("Failed connecting to session.");
      }
      manageWebsocket(
        // works even without captcha because server does not care if verification packet is provided if the requirement is not present
        sessionInfoResponse.info.websocketUrl,
        sessionInfoResponse.info.identifier,
        token,
      );
    } catch (e: any) {
      updateError(e);
      session.starting = false;
    }
  };

  const startNewSession = async (
    parameters: SessionCreationParameters,
    recaptchaValue: string,
  ) => {
    session.starting = true;
    try {
      let token: string | null = null;
      if (recaptchaValue) {
        token = await SessionService.validateRecaptchaValue(recaptchaValue);
      }

      if (!token) {
        throw new Error("Captcha validation failed.");
      }

      const sessionStartResponse: SessionStartResponse =
        await SessionService.startSession(parameters, token);
      if (!sessionStartResponse.status || !sessionStartResponse.info) {
        throw new Error("Failed to start a new session.");
      }
      console.log(token);
      manageWebsocket(
        sessionStartResponse.info.websocketUrl,
        sessionStartResponse.info.identifier,
        token,
      );
    } catch (e: any) {
      updateError(e);
      session.starting = false;
    }
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
          terminationTime,
        },
        updateError,
        session,
        sessionManagement: {
          openSocketToExistingSession,
          startNewSession,
          exitSession,
        },
        setNotificationRef,
        sendNotificationFromLocal,
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
