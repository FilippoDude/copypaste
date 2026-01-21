"use client";
import { useParams, useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useReducer, useRef, useState } from "react";
import Image from "next/image";
import ToastComponent from "@/app/components/toast-component";
import { useSessionContext } from "@/app/sessionContext";

export default function SessionPage() {
  const { session, sessionManagement, sessionData, sendNotificationFromLocal } =
    useSessionContext();
  const { slug } = useParams();
  const latestCopyId = useRef(0);
  const [dateStartTime, setDateStartTime] = useState<string>("");

  const inputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    sessionData.updateCurrentText(e.target.value);
  };

  useEffect(() => {
    if (
      !session.socket ||
      session.socket.socketInfo.identifier != slug ||
      session.socket.webSocket.readyState == WebSocket.CLOSED
    ) {
      if (typeof slug == "string")
        sessionManagement.accessExistingSession(slug);
    }
  }, []);

  const copySessionIdToClipboard = () => {
    if (session.socket) {
      navigator.clipboard.writeText(session.socket.socketInfo.identifier);
      sendNotificationFromLocal(
        "" +
          latestCopyId.current.toString() +
          " | Session id copied to clipboard!",
      );
      latestCopyId.current = latestCopyId.current + 1;
    }
  };

  useEffect(() => {
    const date = new Date(sessionData.startTime);
    const formattedDate: string =
      date.getDate().toString() +
      "/" +
      (date.getMonth() + 1).toString() +
      "/" +
      date.getFullYear().toString() +
      " | " +
      date.getHours() +
      ":" +
      date.getMinutes() +
      ":" +
      date.getMinutes();
    setDateStartTime(formattedDate);
  }, [sessionData.startTime]);

  return (
    <div>
      <ToastComponent></ToastComponent>
      <div className="fixed top-2 right-2 w-60 h-20 bg-green-200 rounded-2xl p-2 border-gray-400 border-2 z-10 flex flex-row">
        <div>
          <p className="font-bold text-gray-600">Session id:</p>
          <button
            onClick={copySessionIdToClipboard}
            className="flex items-start flex-col cursor-pointer  hover:opacity-50"
          >
            <div className="flex flex-row gap-2">
              <p className="font-bold text-black text-2xl">{slug}</p>
              <Image
                src="/copyicon.svg"
                width={20}
                height={20}
                alt="copyicon"
              ></Image>
            </div>
          </button>
        </div>
        <div className="w-20 h-full top-0 right-0 absolute flex items-center pr-2">
          <button
            className="cursor-pointer hover:opacity-50"
            onClick={sessionManagement.exitSession}
          >
            <Image
              src="/exit.svg"
              width={0}
              height={0}
              alt="copyicon"
              className="w-16 h-full"
            ></Image>
          </button>
        </div>
      </div>

      <div className="fixed top-25 right-2 w-60 h-17 bg-green-200 rounded-2xl p-2 border-gray-400 border-2 z-10 flex flex-row">
        <div>
          <p className="font-bold text-gray-600">Session start time</p>
          <p>{dateStartTime}</p>
        </div>
      </div>
      <div className="relative w-full h-screen bg-gray-100">
        <textarea
          placeholder="Psst... Write in here"
          onChange={inputChange}
          value={sessionData.currentText}
          className="relative w-full h-screen p-2"
        ></textarea>
      </div>
    </div>
  );
}
