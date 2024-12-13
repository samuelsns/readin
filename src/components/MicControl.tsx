import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Mic } from 'lucide-react'

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface MicrophoneControlProps {
  onSpeechResult: (text: string) => void;
  onListeningChange: (listening: boolean) => void;
}

export default function MicrophoneControl({
  onSpeechResult,
  onListeningChange,
}: MicrophoneControlProps) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition && !recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const last = event.results.length - 1;
      const words = event.results[last][0].transcript.trim().split(' ');
      const lastWord = words[words.length - 1];
      // Send the raw spoken text without any conversion
      onSpeechResult(lastWord ? lastWord : '');
    };

    recognition.onstart = () => {
      setIsListening(true);
      onSpeechResult(''); // Reset the text when starting
      onListeningChange(true);
    };

    recognition.onend = () => {
      setIsListening(false);
      onListeningChange(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      onListeningChange(false);
    };
  }, [onSpeechResult, setIsListening, onListeningChange]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      console.error('Speech recognition not supported');
      return;
    }

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
    } catch (error) {
      console.error('Error stopping recognition:', error);
    }
  }, []);

  return (
    <Button
      onClick={isListening ? stopListening : startListening}
      className={`${
        isListening 
          ? "bg-red-600 hover:bg-red-700" 
          : "bg-[#14162c] hover:bg-[#14162c]/90"
      } text-white px-6 h-10 inline-flex items-center justify-center gap-2 rounded-md transition-colors`}
    >
      <Mic className="w-4 h-4" />
      {isListening ? "Stop Reading" : "Start Reading"}
    </Button>
  );
}