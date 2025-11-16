
import { useState, useEffect, useCallback } from 'react';

export const useSpeechSynthesis = () => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const updateVoices = useCallback(() => {
    setVoices(window.speechSynthesis.getVoices());
  }, []);

  useEffect(() => {
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      window.speechSynthesis.cancel();
    };
  }, [updateVoices]);

  const speak = useCallback((text: string, voice: SpeechSynthesisVoice) => {
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    
    utterance.onpause = () => {
      setIsSpeaking(true);
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    
    utterance.onerror = (event) => {
      console.error('SpeechSynthesisUtterance.onerror', event);
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.cancel(); // Cancel any previous speech
    window.speechSynthesis.speak(utterance);
  }, []);

  const cancel = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    window.speechSynthesis.pause();
  }, []);

  const resume = useCallback(() => {
    window.speechSynthesis.resume();
  }, []);

  return { voices, speak, cancel, pause, resume, isSpeaking, isPaused };
};
