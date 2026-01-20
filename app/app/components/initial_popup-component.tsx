import { ChangeEvent, Ref, useEffect, useRef, useState } from "react";
import { useSessionContext } from "../appContext";
import ReCAPTCHA from "react-google-recaptcha";
export default function InitialPopupComponent({
  accessExistingSession,
  startNewSession,
  changeRecaptchaValue,
  recaptchaValue,
}: {
  accessExistingSession: (sessionId: string) => void;
  startNewSession: () => void;
  changeRecaptchaValue: (text: string | null) => void;
  recaptchaValue: string | null;
}) {
  const { error } = useSessionContext();
  const [sessionId, setSessionId] = useState<string>("");

  const sessionIdInput = (e: ChangeEvent<HTMLInputElement>) => {
    setSessionId(e.target.value);
  };

  const connectClick = () => {
    accessExistingSession(sessionId);
  };

  const onRecaptchaChange = (e: string | null) => {
    if (e) {
      changeRecaptchaValue(e);
    }
  };

  const onRecaptchaExpire = () => {
    changeRecaptchaValue(null);
  };

  return (
    <div className="fixed w-full h-full flex items-center justify-center">
      <div className="relative w-fit h-130 px-10 bg-green-200 rounded-2xl border-2 border-gray-400 flex items-center justify-center flex-col gap-10">
        <div className="flex flex-row gap-5">
          <input
            onChange={sessionIdInput}
            className="bg-green-300 rounded-xl w-150 h-20 border-2 border-gray-100 px-2"
            type="text"
          />
          <button
            disabled={sessionId.length == 0 || !recaptchaValue ? true : false}
            onClick={connectClick}
            className="bg-yellow-200 w-30 h-20 rounded-xl font-bold border-2 border-gray-100 text-green-500 cursor-pointer text-2xl hover:opacity-75 select-none disabled:opacity-50"
          >
            Connect
          </button>
        </div>
        <div>
          <p className="font-bold text-black text-2xl">OR</p>
        </div>
        <div className="w-full">
          <button
            disabled={!recaptchaValue}
            onClick={startNewSession}
            className={`bg-yellow-200 h-20 rounded-xl font-bold border-2 text-green-500 cursor-pointer text-2xl w-full hover:opacity-75 select-none disabled:opacity-50`}
          >
            Start session
          </button>
        </div>
        {error ? <p className="text-xl text-red-700">{error}</p> : null}

        <ReCAPTCHA
          onChange={onRecaptchaChange}
          onExpired={onRecaptchaExpire}
          sitekey="6Ldjx1AsAAAAAK4Xae3ztA4woSzJGPTE-MbBE5Np"
        />
      </div>
    </div>
  );
}
