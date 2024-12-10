"use client";

import React, { useState } from 'react'
import TextDisplay from './TextDisplay'
import MicrophoneControl from './MicControl'

interface ReadingComponentProps {
  textToRead: string;
}

export default function ReadingComponent({ textToRead = "" }: ReadingComponentProps) {
  const [spokenText, setSpokenText] = useState("")
  const [isListening, setIsListening] = useState(false)

  const handleSpeechResult = (text: string) => {
    setSpokenText(text)
  }

  const handleListeningStateChange = (listening: boolean) => {
    setIsListening(listening)
  }

  return (
    <div className="space-y-4">
      <TextDisplay 
        textToRead={textToRead} 
        spokenText={spokenText} 
        isListening={isListening}
      />
      <MicrophoneControl 
        onSpeechResult={handleSpeechResult}
        onListeningChange={handleListeningStateChange}
      />
      {spokenText && (
        <div className="mt-4 text-sm text-muted-foreground">
          Spoken text: {spokenText}
        </div>
      )}
    </div>
  )
}