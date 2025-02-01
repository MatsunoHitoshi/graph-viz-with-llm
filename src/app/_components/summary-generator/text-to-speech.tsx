"use client";

import { useState } from "react";
import { SpeakerLoudIcon } from "../icons";

type TextToSpeechProps = {
  text: string;
  className?: string;
};
export const TextToSpeech = ({ text, className }: TextToSpeechProps) => {
  const uttr = new SpeechSynthesisUtterance(text);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  return (
    <button
      className={className}
      onClick={() => {
        if (isSpeaking) {
          setIsSpeaking(false);
          window.speechSynthesis.cancel();
        } else {
          setIsSpeaking(true);
          window.speechSynthesis.speak(uttr);
        }
      }}
    >
      <SpeakerLoudIcon
        height={16}
        width={16}
        color={isSpeaking ? "#f97316" : "white"}
      />
    </button>
  );
};
