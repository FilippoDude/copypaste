import { useEffect, useRef, useState } from "react";
import { useSessionContext } from "../sessionContext";

type Toast = {
  id: number;
  message: string;
};
export default function ToastComponent() {
  const { setNotificationRef } = useSessionContext();
  const [latestSyncToastId, setLatestSyncToastId] = useState<number>(0);
  const [messagesArray, setMessagesArray] = useState<Toast[]>([]);
  const messagesBuffer = useRef<string[]>([]);
  const latestToastId = useRef<number>(0);

  const isBuffering = useRef<boolean>(false);

  const tempId = useRef(0);

  const isMessageIdInMessagesArray = (messageId: number, array: Toast[]) => {
    array.map((member) => {
      if (member.id === messageId) {
        return true;
      }
    });
    return false;
  };
  const handleBuffering = async (text: string | undefined) => {
    if (typeof text === "string") messagesBuffer.current.unshift(text);
    if (!isBuffering.current && messagesBuffer.current.length > 0) {
      isBuffering.current = true;
      const messageToAdd = messagesBuffer.current.pop()!;
      latestToastId.current = latestToastId.current + 1;
      setMessagesArray((array) => {
        const arrayCopy = [
          {
            id: latestToastId.current,
            message: messageToAdd,
          },
          ...array,
        ];

        if (arrayCopy.length > 3) {
          arrayCopy.pop();
        }
        return arrayCopy;
      });
      setLatestSyncToastId(latestToastId.current);

      setTimeout(() => {
        isBuffering.current = false;
        handleBuffering(undefined);
      }, 10);
    }
  };

  const addMessage = (text: string) => {
    handleBuffering(text);
  };

  const testAddMessage = () => {
    addMessage("TEST " + tempId.current);
    tempId.current = tempId.current + 1;
  };

  useEffect(() => {
    setNotificationRef(addMessage);
  }, []);

  return (
    <div className=" fixed w-full h-full z-40 flex flex-col duration-500 transition-all pointer-events-none">
      <div className="absolute right-5 top-50 duration-500 transition-all">
        {messagesArray.map((element, i) => {
          return (
            <div key={i} className="">
              <p>{element.message}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
