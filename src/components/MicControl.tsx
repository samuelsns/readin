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
  const restartTimerRef = useRef<NodeJS.Timeout | null>(null);

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
    recognition.interimResults = false; // Set to false for more stable word recognition
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

      // Clear and set a new restart timer
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
      }
      restartTimerRef.current = setTimeout(() => {
        if (isListening) {
          try {
            recognition.stop();
            recognition.start();
          } catch (error) {
            console.error('Error in auto-restart:', error);
          }
        }
      }, 5000); // 5 seconds of silence before restart
    };

    recognition.onstart = () => {
      setIsListening(true);
      onSpeechResult(''); // Reset the text when starting
      onListeningChange(true);
    };

    recognition.onend = () => {
      if (isListening) {
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
      if (event.error === 'not-allowed' || event.error === 'audio-capture') {
        setIsListening(false);
        onListeningChange(false);
      } else if (isListening) {
        try {
          recognition.start();
        } catch (error) {
          console.error('Error restarting recognition:', error);
          setIsListening(false);
          onListeningChange(false);
        }
      }
    };

    return () => {
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
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
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
    }
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