"use client";
import InitialPopupComponent from "./components/initial_popup-component";
import { useSessionContext } from "./appContext";
export default function Home() {
  const { session, accessExistingSession, startNewSession } =
    useSessionContext();
  return (
    <div className="w-full h-full relative bg-gray-200">
      {session ? (
        <InitialPopupComponent
          accessExistingSession={accessExistingSession}
          startNewSession={startNewSession}
        />
      ) : null}
    </div>
  );
}
