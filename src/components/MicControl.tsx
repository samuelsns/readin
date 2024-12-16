"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Mic } from 'lucide-react'
import '../types/speechRecognition'

interface MicrophoneControlProps {
  onSpeechResult: (text: string) => void
  onListeningChange: (isListening: boolean) => void
}

export default function MicrophoneControl({
  onSpeechResult,
  onListeningChange,
}: MicrophoneControlProps) {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognition) {
        console.error("Speech recognition is not supported in this browser.")
        alert("Speech recognition is not supported in your browser. Please try using Chrome or Edge for the best experience.")
        return
      }

      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.maxAlternatives = 1
      recognition.lang = 'en-US'

      recognitionRef.current = recognition

      return () => {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop()
          } catch (error) {
            console.error('Error stopping recognition on cleanup:', error)
          }
        }
      }
    } catch (error) {
      console.error('Error initializing speech recognition:', error)
      alert('There was an error initializing speech recognition. Please refresh the page or try a different browser.')
    }
  }, [])

  const setupRecognitionHandlers = useCallback((recognition: any) => {
    recognition.onresult = (event: any) => {
      const last = event.results.length - 1
      const result = event.results[last]
      
      if (result.isFinal) {
        const text = result[0].transcript.trim()
        onSpeechResult(text)
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      if (event.error === 'not-allowed' || event.error === 'audio-capture') {
        setIsListening(false)
        onListeningChange(false)
        alert('Please allow microphone access to use this feature.')
      }
    }

    recognition.onend = () => {
      if (isListening) {
        try {
          recognition.start()
        } catch (error) {
          console.error('Error restarting recognition:', error)
          setIsListening(false)
          onListeningChange(false)
        }
      }
    }
  }, [onSpeechResult, onListeningChange, isListening])

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return

    if (!isListening) {
      try {
        setupRecognitionHandlers(recognitionRef.current)
        recognitionRef.current.start()
        setIsListening(true)
        onListeningChange(true)
      } catch (error) {
        console.error('Error starting recognition:', error)
        alert('There was an error starting speech recognition. Please refresh the page or try a different browser.')
      }
    } else {
      try {
        recognitionRef.current.stop()
        setIsListening(false)
        onListeningChange(false)
      } catch (error) {
        console.error('Error stopping recognition:', error)
      }
    }
  }, [isListening, onListeningChange, setupRecognitionHandlers])

  return (
    <Button
      onClick={toggleListening}
      className={`${
        isListening 
          ? "bg-red-600 hover:bg-red-700" 
          : "bg-[#14162c] hover:bg-[#14162c]/90"
      } text-white px-6 h-10 inline-flex items-center justify-center gap-2 rounded-md transition-colors`}
    >
      <Mic className="w-4 h-4" />
      {isListening ? "Stop Reading" : "Start Reading"}
    </Button>
  )
}