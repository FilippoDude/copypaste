"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, useEffect, useReducer, useRef, useState } from "react";
import Image from "next/image";
import ToastComponent from "@/app/components/toast.component";
import { useSessionContext } from "../../../sessionContext";

export default function SessionPage() {
  const { session, sessionManagement, sessionData, sendNotificationFromLocal } =
    useSessionContext();
  const { slug } = useParams(); // session id
  const searchParameters = useSearchParams();
  const latestCopyId = useRef(0);
  const [dateStartTime, setDateStartTime] = useState<string>("");
  const [dateTerminationTime, setDateTerminationTime] = useState<string>("");

  const inputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    //console.log(e);
    sessionData.updateCurrentText(e.target.value);
  };

  useEffect(() => {
    // THIS RUNS TWICE BECAUSE SESSION ISN'T SET FAST ENOUGH SINCE IT HAS TO PASS TROUGH THE API TO VALIDATE THE JWT AND THEN SET THE SOCKET
    // MAKE IT SOME WAY THAT IT DOESN'T RUN TWICE
    if (
      !session.socket ||
      session.socket.socketInfo.identifier != slug ||
      session.socket.webSocket.readyState == WebSocket.CLOSED
    ) {
      if (session.starting) return;
      if (typeof slug == "string") {
        const token: string | null = searchParameters.get("token");
        if (token && token.length > 0) {
          console.log("OPENED WITH TOKEN");
          sessionManagement.openSocketToExistingSession(slug, token);
          return;
        }
        console.log("OPENED WITHOUT");
        sessionManagement.openSocketToExistingSession(slug);
      }
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
    setStartTimeDate();
    setTerminationTimeDate();
  }, [sessionData.startTime]);

  const setStartTimeDate = () => {
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
  };

  const setTerminationTimeDate = () => {
    const date = new Date(sessionData.terminationTime);
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
    setDateTerminationTime(formattedDate);
  };

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

      <div className="fixed top-25 right-2 w-60 h-30 bg-green-200 rounded-2xl p-2 border-gray-400 border-2 z-10 flex flex-row">
        <div>
          <p className="font-bold text-gray-600">Session start time</p>
          <p>{dateStartTime}</p>
          <p className="font-bold text-gray-600">Session termination time</p>
          <p>{dateTerminationTime}</p>
        </div>
      </div>
      <div className="relative w-full h-screen bg-gray-100">
        <textarea
          maxLength={500000}
          placeholder="Psst... Write in here"
          onChange={inputChange}
          value={sessionData.currentText}
          className="relative w-full h-screen p-2"
        ></textarea>
      </div>
    </div>
  );
}
