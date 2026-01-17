"use client";
import { useSessionContext } from "@/app/appContext";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SessionPage() {
  const { session, accessExistingSession } = useSessionContext();
  const router = useRouter();
  const { slug } = useParams();

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

  return <p>Anyway: {slug}</p>;
}
