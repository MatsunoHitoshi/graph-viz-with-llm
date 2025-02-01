"use client";

import { SpeakerLoudIcon } from "../icons";

type TextToSpeechProps = {
  text: string;
  className?: string;
};
export const TextToSpeech = ({ text, className }: TextToSpeechProps) => {
  const uttr = new SpeechSynthesisUtterance(text);

  return (
    <button
      className={className}
      onClick={() => {
        window.speechSynthesis.speak(uttr);
      }}
    >
      <SpeakerLoudIcon height={16} width={16} />
    </button>
  );
};
