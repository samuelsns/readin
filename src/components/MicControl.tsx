import React, { useState, useCallback, useRef } from 'react'
import { Mic, MicOff } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { SpeechRecognitionEvent, SpeechRecognition } from '../types/speechRecognition';

export default function MicControl({ onSpeechResult, onListeningChange }: { onSpeechResult: (text: string) => void; onListeningChange?: (isListening: boolean) => void }) {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const lastProcessedTextRef = useRef<string>("")

  const updateListeningState = useCallback((listening: boolean) => {
    setIsListening(listening)
    onListeningChange?.(listening)
    if (!listening) {
      lastProcessedTextRef.current = ""
    }
  }, [onListeningChange])

  const processTranscript = useCallback((transcript: string) => {
    // Clean up the transcript
    const cleanTranscript = transcript.trim().toLowerCase()
    
    // Only process if we have new content
    if (cleanTranscript && cleanTranscript !== lastProcessedTextRef.current) {
      lastProcessedTextRef.current = cleanTranscript
      onSpeechResult(cleanTranscript)
    }
  }, [onSpeechResult])

  const startListening = useCallback(() => {
    updateListeningState(true)
    lastProcessedTextRef.current = ""

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.error("Speech recognition is not supported in this browser.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.resultIndex]
      if (result) {
        const transcript = result[0].transcript
        // Only process if this is a final result or it's a new interim result
        if (result.isFinal || transcript.trim() !== lastProcessedTextRef.current) {
          processTranscript(transcript)
        }
      }
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event)
      updateListeningState(false)
    }

    recognition.onend = () => {
      if (isListening) {
        // Restart if we're still supposed to be listening
        recognition.start()
      } else {
        updateListeningState(false)
      }
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [isListening, processTranscript, updateListeningState])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      updateListeningState(false)
    }
  }, [updateListeningState])

  return (
    <Button
      onClick={isListening ? stopListening : startListening}
      variant={isListening ? "destructive" : "default"}
      className="w-full max-w-xs mx-auto flex items-center justify-center gap-2"
    >
      {isListening ? (
        <>
          <MicOff className="w-4 h-4" />
          Stop Reading
        </>
      ) : (
        <>
          <Mic className="w-4 h-4" />
          Start Reading
        </>
      )}
    </Button>
  )
}