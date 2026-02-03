"use client";
import { ChangeEvent, useState } from "react";

import ReCAPTCHA from "react-google-recaptcha";
import { SessionCreationParameters } from "../services/session.service";
import { useRouter } from "next/navigation";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

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

    setRecaptchaValue(null);
  };

  return (
    <div className="fixed w-full h-full flex items-center justify-center">
      <div className="relative w-fit min-h-130 px-10 py-5 bg-green-200 rounded-2xl border-2 border-gray-400 flex items-center justify-center flex-col gap-5">
        <div className="flex flex-row gap-5">
          <TextField
            onChange={sessionIdInput}
            id="outlined-basic"
            label="Session Id"
            variant="outlined"
            className="w-150 "
          />
          <Button
            disabled={sessionId.length == 0}
            onClick={connectClick}
            variant="contained"
          >
            Connect
          </Button>
        </div>
        <div>
          <p className="font-bold text-black text-xl">OR</p>
        </div>
        <div className="w-full flex items-center flex-col">
          <Button
            disabled={!recaptchaValue}
            onClick={startNewSessionClick}
            variant="contained"
            className=" w-full h-20"
          >
            Start session
          </Button>
          <div className="mt-2">
            <Accordion>
              <AccordionSummary
                expandIcon={<ArrowDropDownIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <Typography component="span">
                  Additional session options
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <div className="flex flex-row gap-20">
                  <div className="flex flex-col">
                    <p className="opacity-75">Require following password</p>
                    <TextField
                      id="filled-basic"
                      label="Password"
                      variant="filled"
                      value={requirePassword}
                      onChange={requirePasswordChange}
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="opacity-75">Require captcha</p>
                    <input
                      checked={requireCaptcha}
                      onChange={requireCaptchaChange}
                      type="checkbox"
                      className="bg-white w-10 h-10"
                    />
                  </div>
                </div>
              </AccordionDetails>
            </Accordion>
          </div>
          <div className="flex flex-row gap-6"></div>
        </div>
        {error ? (
          <p className="text-xl text-red-700">{error.toString()}</p>
        ) : null}

        <ReCAPTCHA
          onChange={onRecaptchaChange}
          onExpired={onRecaptchaExpire}
          sitekey="6Ldjx1AsAAAAAK4Xae3ztA4woSzJGPTE-MbBE5Np"
        />
      </div>
    </div>
  );
}
