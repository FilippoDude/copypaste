import {
  ChangeEvent,
  ChangeEventHandler,
  Ref,
  useEffect,
  useRef,
  useState,
} from "react";

import ReCAPTCHA from "react-google-recaptcha";
import { SessionCreationParameters } from "../services/session.service";
import { useRouter } from "next/navigation";
export default function InitialPopupComponent({
  error,
  startNewSession,
}: {
  error: string | null;
  startNewSession: (
    parameters: SessionCreationParameters,
    recaptchaValue: string,
  ) => void;
}) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string>("");
  const [requireCaptcha, setRequireCaptcha] = useState<boolean>(false);
  const [requirePassword, setRequirePassword] = useState<string>("");
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null);

  const sessionIdInput = (e: ChangeEvent<HTMLInputElement>) => {
    setSessionId(e.target.value);
  };

  const connectClick = () => {
    router.replace("/pages/connect/" + sessionId);
  };

  const onRecaptchaChange = (e: string | null) => {
    if (e) {
      setRecaptchaValue(e);
    }
  };

  const onRecaptchaExpire = () => {
    setRecaptchaValue(null);
  };

  const requireCaptchaChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRequireCaptcha(e.target.checked);
  };

  const requirePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRequirePassword(e.target.value);
  };

  const startNewSessionClick = () => {
    if (recaptchaValue)
      startNewSession(
        {
          requireCaptcha: requireCaptcha,
          requirePassword: requirePassword,
        },
        recaptchaValue,
      );
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
            disabled={sessionId.length == 0}
            onClick={connectClick}
            className="bg-yellow-200 w-30 h-20 rounded-xl font-bold border-2 border-gray-100 text-green-500 cursor-pointer text-2xl hover:opacity-75 select-none disabled:opacity-50"
          >
            Connect
          </button>
        </div>
        <div>
          <p className="font-bold text-black text-2xl">OR</p>
        </div>
        <div className="w-full flex items-center flex-col">
          <button
            disabled={!recaptchaValue}
            onClick={startNewSessionClick}
            className={`bg-yellow-200 h-20 rounded-xl font-bold border-2 text-green-500 cursor-pointer text-2xl w-full hover:opacity-75 select-none disabled:opacity-50`}
          >
            Start session
          </button>
          <button>Additional session options</button>
          <div className="flex flex-row gap-6">
            <div className="flex flex-col">
              <p className="opacity-75">Require following password</p>
              <input
                type="text"
                className="bg-white"
                placeholder="No password"
                value={requirePassword}
                onChange={requirePasswordChange}
              />
            </div>
            <div className="flex flex-col">
              <p className="opacity-75">Require captcha</p>
              <input
                checked={requireCaptcha}
                onChange={requireCaptchaChange}
                type="checkbox"
                className="bg-white"
              />
            </div>
          </div>
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
