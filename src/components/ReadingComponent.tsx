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
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 p-4 w-full">
        <div className="max-w-[95%] mx-auto">
          <DifficultySelector 
            currentDifficulty={difficulty}
            onDifficultyChange={handleDifficultyChange}
          />
          <div className="space-y-4">
            <TextDisplay 
              textToRead={textToRead} 
              spokenText={spokenText}
              isListening={isListening}
              difficulty={difficulty}
            />
            <div className="relative">
              <div className="flex justify-center mb-2">
                <MicrophoneControl 
                  onSpeechResult={handleSpeechResult}
                  onListeningChange={handleListeningStateChange}
                />
              </div>
              <AnimatePresence mode="wait">
                {isListening && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute left-1/2 transform -translate-x-1/2 mt-2 bg-blue-50 px-4 py-2 rounded-full text-sm font-medium text-blue-600 whitespace-nowrap"
                  >
                    {spokenText || "Listening..."}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}