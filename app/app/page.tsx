"use client";
import InitialPopupComponent from "./components/initial_popup-component";
import { useSessionContext } from "./sessionContext";
export default function Home() {
  const { session, sessionManagement, changeRecaptchaValue, recaptchaValue } =
    useSessionContext();
  return (
    <div className="w-full h-full relative bg-gray-200">
      {session ? (
        <InitialPopupComponent
          accessExistingSession={sessionManagement.accessExistingSession}
          startNewSession={sessionManagement.startNewSession}
          changeRecaptchaValue={changeRecaptchaValue}
          recaptchaValue={recaptchaValue}
        />
      ) : null}
    </div>
  );
}
