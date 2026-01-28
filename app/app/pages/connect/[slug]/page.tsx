"use client";
import {
  ClientRequirements,
  ConnectionResponse,
  SessionInfoResponse,
  SessionService,
} from "@/app/services/session.service";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";

export default function ConnectPage() {
  const router = useRouter();
  const { slug } = useParams(); // session id
  const [clientRequirements, setClientRequirements] =
    useState<ClientRequirements | null>(null);
  const [password, setPassword] = useState<string>("");
  const [recaptchaValue, setRecaptchaValue] = useState<string | undefined>(
    undefined,
  );
  const [error, setError] = useState<string>("");

  const getSessionInfo = async (sessionId: string) => {
    const sessionInfoResponse: SessionInfoResponse =
      await SessionService.getSessionInfo(sessionId);
    if (!sessionInfoResponse.status || !sessionInfoResponse.info) {
      setError("No response from server...");
      return;
    }
    console.log(sessionInfoResponse.clientRequirements);
    if (
      sessionInfoResponse.clientRequirements &&
      (sessionInfoResponse.clientRequirements.captchaRequired ||
        sessionInfoResponse.clientRequirements.passwordRequired)
    ) {
      console.log("SET REQUIREMENTS");
      setClientRequirements(sessionInfoResponse.clientRequirements);
    } else {
      setClientRequirements(null);
      router.replace("/pages/session/" + sessionId);
    }
  };
  useEffect(() => {
    if (typeof slug === "string") getSessionInfo(slug);
  }, []);

  const submit = async () => {
    // HERE MAKE CONNECTION REQUEST TO SERVER FOR TOKEN AND SEND USER TO PAGE SESSION PAGE WITH TOKEN IN URL
    if (typeof slug === "string") {
      const connectionResponse: ConnectionResponse =
        await SessionService.getConnectionToken(slug, {
          recaptchaValue: recaptchaValue,
          password: password,
        });
      if (!connectionResponse.status || !connectionResponse.token) {
        if (!connectionResponse.error) setError("An error has occurred.");
        else if (connectionResponse.error === "SESSION_NOT_FOUND")
          setError("Session not found.");
        else if (connectionResponse.error === "INVALID_PASSWORD")
          setError("Password is invalid.");
        else if (connectionResponse.error === "INVALID_CAPTCHA")
          setError("Captcha is invalid.");
        return;
      }
      router.replace(
        `/pages/session/${slug}?token=${connectionResponse.token}`,
      ); // Append the token so it gets to session page
    }
  };

  const passwordInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const onRecaptchaChange = (recaptchaValue: string | null) => {
    if (recaptchaValue) setRecaptchaValue(recaptchaValue);
  };

  const onRecaptchaExpire = () => {
    setRecaptchaValue(undefined);
  };

  return (
    <div className="fixed w-full h-full flex items-center justify-center">
      <div className="flex flex-col items-center justify-center bg-green-200 p-4 rounded-2xl">
        {clientRequirements?.captchaRequired ? (
          <>
            <p>CAPTCHA REQUIRED</p>
            <ReCAPTCHA
              onChange={onRecaptchaChange}
              onExpired={onRecaptchaExpire}
              sitekey="6Ldjx1AsAAAAAK4Xae3ztA4woSzJGPTE-MbBE5Np"
            />
          </>
        ) : null}

        {clientRequirements?.passwordRequired ? (
          <div>
            <p>PASSWORD REQUIRED</p>
            <input
              className="bg-white p-2 rounded-lg"
              type="text"
              onChange={passwordInputChange}
            />
          </div>
        ) : null}
        <p>{error}</p>
        <button
          className="cursor-pointer bg-yellow-200 hover:opacity-75 px-2 py-1 rounded-xl mt-2"
          onClick={submit}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
