import React, { useState, useCallback, useRef } from 'react'
import { Mic, MicOff } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface MicControlProps {
  onSpeechResult: (text: string) => void;
}

export default function MicControl({ onSpeechResult }: MicControlProps) {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const startListening = useCallback(() => {
    setIsListening(true)

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.error("Speech recognition is not supported in this browser.")
      return
    }

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition

    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.continuous = true

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join(' ')

      onSpeechResult(transcript)
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      if (isListening) {
        recognition.start()
      }
    }

    recognition.start()
  }, [onSpeechResult, isListening])

  const stopListening = useCallback(() => {
    setIsListening(false)
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }, [])

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  return (
    <Button 
      onClick={toggleListening} 
      variant={isListening ? "destructive" : "outline"}
      className={`w-full flex items-center justify-center gap-2 ${
        isListening ? 'text-destructive-foreground' : 'text-muted-foreground'
      }`}
      aria-label={isListening ? "Stop listening" : "Start listening"}
    >
      {isListening ? (
        <>
          <MicOff className="h-5 w-5" />
          Stop Listening
        </>
      ) : (
        <>
          <Mic className="h-5 w-5" />
          Start Listening
        </>
      )}
    </Button>
  )
}