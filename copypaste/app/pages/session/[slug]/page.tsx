"use client";
import { useSessionContext } from "@/app/appContext";
import { useParams, useRouter } from "next/navigation";
import { ChangeEvent, useEffect } from "react";

export default function SessionPage() {
  const { session, accessExistingSession, updateCurrentText, currentText } =
    useSessionContext();
  const router = useRouter();
  const { slug } = useParams();

  const inputChange = (e: ChangeEvent<HTMLInputElement>) => {
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

  return (
    <div>
      <p>Anyway: {slug}</p>
      <input type="text" onChange={inputChange} value={currentText} />
    </div>
  );
}
