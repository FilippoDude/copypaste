"use client";
import {
  ClientRequirements,
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
      const token: string | null = await SessionService.getConnectionToken(
        slug,
        {
          recaptchaValue: recaptchaValue,
          password: password,
        },
      );
      if (!token) {
        // SHOW ERROR MESSAGE FOR NON RESPECTED SESSION CLIENT CONDITIONS
        setError("CONDITIONS NOT MET");
      }
      console.log(token);
      router.replace(`/pages/session/${slug}?token=${token}`); // Append the token so it gets to session page
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
    <div className="fixed w-full h-full">
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

      {clientRequirements?.captchaRequired ? (
        <>
          <p>PASSWORD REQUIRED</p>
          <input type="text" onChange={passwordInputChange} />
        </>
      ) : null}
      <p>{error}</p>
      <button onClick={submit}>Submit</button>
    </div>
  );
}
