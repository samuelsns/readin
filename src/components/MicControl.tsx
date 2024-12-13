import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Mic } from 'lucide-react'
import '../types/speechRecognition';

interface MicrophoneControlProps {
  onSpeechResult: (text: string) => void;
  onListeningChange: (isListening: boolean) => void;
}

export default function MicrophoneControl({
  onSpeechResult,
  onListeningChange,
}: MicrophoneControlProps) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    // Initialize SpeechRecognition only once when component mounts
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Speech recognition is not supported in this browser.");
      alert("Speech recognition is not supported in your browser. Please try using Chrome or Edge for the best experience.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognitionRef.current = recognition;

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
      onSpeechResult(lastWord ? lastWord : '');
    };

    recognition.onstart = () => {
      setIsListening(true);
      onSpeechResult(''); // Reset the text when starting
      onListeningChange(true);
    };

    recognition.onend = () => {
      // Only stop if we explicitly called stop
      if (isListening) {
        // Restart recognition if it ended but we're supposed to be listening
        try {
          recognition.start();
        } catch (error) {
          console.error('Error restarting recognition:', error);
          setIsListening(false);
          onListeningChange(false);
        }
      } else {
        setIsListening(false);
        onListeningChange(false);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      // Only stop on critical errors
      if (event.error === 'not-allowed' || event.error === 'audio-capture') {
        setIsListening(false);
        onListeningChange(false);
      }
      // For other errors, try to restart if we're supposed to be listening
      else if (isListening) {
        try {
          recognition.start();
        } catch (error) {
          console.error('Error restarting recognition:', error);
          setIsListening(false);
          onListeningChange(false);
        }
      }
    };
  }, [onSpeechResult, setIsListening, onListeningChange, isListening]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setIsListening(false); // Set this before stopping to prevent auto-restart
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