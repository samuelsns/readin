"use client";

import React, { useState } from 'react'
import TextDisplay from './TextDisplay'
import MicrophoneControl from './MicControl'
import DifficultySelector, { Difficulty } from './DifficultySelector'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic } from 'lucide-react'

interface ReadingComponentProps {
  textToRead: string;
}

export default function ReadingComponent({ textToRead = "" }: ReadingComponentProps) {
  const [spokenText, setSpokenText] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner')

  const handleSpeechResult = (text: string) => {
    setSpokenText(text)
  }

  const handleListeningStateChange = (listening: boolean) => {
    setIsListening(listening)
  }

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty)
  }

  return (
    <div className="space-y-6 p-4">
      <DifficultySelector 
        currentDifficulty={difficulty}
        onDifficultyChange={handleDifficultyChange}
      />
      <TextDisplay 
        textToRead={textToRead} 
        spokenText={spokenText} 
        isListening={isListening}
        difficulty={difficulty}
      />
      <div className="flex flex-col items-center gap-4">
        <MicrophoneControl 
          onSpeechResult={handleSpeechResult}
          onListeningChange={handleListeningStateChange}
        />
        <AnimatePresence mode="wait">
          {isListening && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 font-medium text-lg"
            >
              <Mic className="w-4 h-4" />
              <span>
                {spokenText || "Listening..."}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}