"use client";
import InitialPopupComponent from "./components/initial_popup.component";
import { useSessionContext } from "./sessionContext";
export default function Home() {
  const { sessionManagement, error } = useSessionContext();
  return (
    <div className="w-full h-full relative bg-gray-200">
      <InitialPopupComponent
        error={error}
        startNewSession={sessionManagement.startNewSession}
      />
    </div>
  );
}
