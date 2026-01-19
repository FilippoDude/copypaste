"use client";
import { useSessionContext } from "@/app/appContext";
import { useParams, useRouter } from "next/navigation";
import { ChangeEvent, useEffect } from "react";
import Image from "next/image";
import ToastComponent from "@/app/components/toast-component";

export default function SessionPage() {
  const {
    session,
    accessExistingSession,
    updateCurrentText,
    currentText,
    exitSession,
  } = useSessionContext();
  const { slug } = useParams();

  const inputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    updateCurrentText(e.target.value);
  };

  useEffect(() => {
    if (
      !session.active ||
      !session.socket ||
      session.socket.socketInfo.identifier != slug ||
      session.socket.webSocket.readyState == WebSocket.CLOSED
    ) {
      if (typeof slug == "string") accessExistingSession(slug);
    }
  }, []);

  const copySessionIdToClipboard = () => {
    if (session.socket)
      navigator.clipboard.writeText(session.socket?.socketInfo.identifier);
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
            onClick={exitSession}
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
      <div className="relative w-full h-screen bg-gray-100">
        <textarea
          placeholder="Psst... Write in here"
          onChange={inputChange}
          value={currentText}
          className="relative w-full h-screen p-2"
        ></textarea>
      </div>
    </div>
  );
}
