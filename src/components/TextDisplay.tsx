import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { levenshteinDistance2 } from '@/lib/calculateMatch'
import { Button } from "@/components/ui/button"
import { RotateCcw, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Types and Interfaces
interface Word {
  text: string
  status: 'waiting' | 'current' | 'correct' | 'incorrect'
  confidence: number
  isPunctuation: boolean
}

interface TextDisplayProps {
  textToRead: string
  spokenText: string
  isListening?: boolean
}

// Map of similar-sounding words
const similarSoundingWords: { [key: string]: string[] } = {
  'fun': ['fan'],
  'fan': ['fun'],
  'aloud': ['allowed'],
  'allowed': ['aloud'],
  'there': ['their', 'they\'re'],
  'their': ['there', 'they\'re'],
  'they\'re': ['there', 'their'],
  'to': ['too', 'two'],
  'too': ['to', 'two'],
  'two': ['to', 'too'],
  'write': ['right'],
  'right': ['write'],
  'here': ['hear'],
  'hear': ['here']
}

// Feedback messages for different scenarios
const feedbackMessages = {
  great: [
    "Amazing! 🌟",
    "Fantastic job! 🎉",
    "You're a star! ⭐",
    "Keep it up! 🚀",
    "Wonderful! 🌈"
  ],
  good: [
    "Good try! 👍",
    "Almost there! 💫",
    "Keep going! 🌟",
    "You can do it! 💪",
    "Nice effort! 🌅"
  ]
}

export default function TextDisplay({ 
  textToRead = "Sample text", 
  spokenText = "",
  isListening = false 
}: TextDisplayProps) {
  // State Management
  const [words, setWords] = useState<Word[]>([])
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0)
  const [lastProcessedText, setLastProcessedText] = useState("")
  const [feedback, setFeedback] = useState<string>("")
  const [showFeedback, setShowFeedback] = useState(false)
  const [streak, setStreak] = useState(0)
  const [progress, setProgress] = useState(0)

  // Utility Functions
  const isPunctuation = useCallback((word: string) => (
    /^[.!?,]+$/.test(word.trim())
  ), [])

  const normalizeText = useCallback((text: string) => (
    text.toLowerCase()
      .replace(/[^a-z0-9\s.!?,]/g, '')
      .replace(/([.!?,])/g, '$1')  
      .replace(/\s+/g, ' ')
      .trim()
  ), [])

  // Reset Function
  const handleReset = useCallback(() => {
    const cleanText = normalizeText(textToRead)
    const initialWords = cleanText.split(' ').map(word => ({
      text: word,
      status: 'waiting',
      confidence: 0,
      isPunctuation: isPunctuation(word)
    }))

    const firstWordIndex = initialWords.findIndex(word => !word.isPunctuation)
    if (firstWordIndex !== -1) {
      initialWords[firstWordIndex].status = 'current'
    }

    setWords(initialWords)
    setCurrentWordIndex(firstWordIndex !== -1 ? firstWordIndex : 0)
    setLastProcessedText("")
  }, [textToRead, normalizeText, isPunctuation])

  // Word Processing Functions
  const moveToNextWord = useCallback((words: Word[], currentIndex: number) => {
    let nextIndex = currentIndex + 1
    
    while (nextIndex < words.length && words[nextIndex].isPunctuation) {
      words[nextIndex].status = 'correct'
      words[nextIndex].confidence = 100
      nextIndex++
    }
    
    if (nextIndex < words.length) {
      words[nextIndex].status = 'current'
    }
    
    return nextIndex
  }, [])

  const showRandomFeedback = (isCorrect: boolean) => {
    const messages = isCorrect ? feedbackMessages.great : feedbackMessages.good
    const randomMessage = messages[Math.floor(Math.random() * messages.length)]
    setFeedback(randomMessage)
    setShowFeedback(true)
    setTimeout(() => setShowFeedback(false), 2000)
  }

  // Effects
  useEffect(() => {
    if (!textToRead) return

    const cleanText = normalizeText(textToRead)
    const initialWords = cleanText.split(' ').map(word => ({
      text: word,
      status: 'waiting',
      confidence: 0,
      isPunctuation: isPunctuation(word)
    }))

    const firstWordIndex = initialWords.findIndex(word => !word.isPunctuation)
    if (firstWordIndex !== -1) {
      initialWords[firstWordIndex].status = 'current'
    }

    setWords(initialWords)
    setCurrentWordIndex(firstWordIndex !== -1 ? firstWordIndex : 0)
    setLastProcessedText("")
  }, [textToRead, normalizeText, isPunctuation])

  useEffect(() => {
    if (!textToRead || !spokenText || !isListening || spokenText === lastProcessedText) return
    
    setLastProcessedText(spokenText)
    const cleanSpokenText = normalizeText(spokenText)
    const spokenWords = cleanSpokenText.split(' ')
    const currentSpokenWord = spokenWords[spokenWords.length - 1]

    if (!currentSpokenWord) return

    setWords(prevWords => {
      const newWords = [...prevWords]
      const currentWord = prevWords[currentWordIndex]

      if (!currentWord || currentWord.status === 'correct' || currentWord.isPunctuation) {
        return prevWords
      }

      const normalizedCurrentWord = normalizeText(currentWord.text)
      const normalizedSpokenWord = normalizeText(currentSpokenWord)
      
      const similarWords = similarSoundingWords[normalizedCurrentWord] || []
      const isSimilarSoundingWord = similarWords.includes(normalizedSpokenWord)

      const distance = levenshteinDistance2(normalizedCurrentWord, normalizedSpokenWord)
      const confidence = Math.max(0, 100 - (distance * 33.33))

      if (distance <= 1 || isSimilarSoundingWord) {
        currentWord.status = 'correct'
        currentWord.confidence = isSimilarSoundingWord ? 100 : confidence
        const nextIndex = moveToNextWord(newWords, currentWordIndex)
        setCurrentWordIndex(nextIndex)
        setStreak(prev => prev + 1)
        if (streak >= 2) {
          showRandomFeedback(true)
        }
      } else if (currentSpokenWord.length >= currentWord.text.length) {
        currentWord.status = 'incorrect'
        currentWord.confidence = confidence
        setStreak(0)
        showRandomFeedback(false)
      } else {
        currentWord.status = 'current'
        currentWord.confidence = confidence
      }

      return newWords
    })
  }, [spokenText, isListening, currentWordIndex, normalizeText, moveToNextWord])

  useEffect(() => {
    const correctWords = words.filter(w => w.status === 'correct').length
    const totalWords = words.filter(w => !w.isPunctuation).length
    setProgress(totalWords > 0 ? correctWords / totalWords : 0)
  }, [words])

  // Styling
  const getWordStyle = (word: Word) => {
    const baseStyle = 'px-3 py-2 rounded-lg mx-1 transition-all duration-300 '
    
    if (word.isPunctuation) {
      return baseStyle + (word.status === 'correct' ? 'text-green-500' : 'text-gray-400')
    }
    
    const styles = {
      current: baseStyle + 'bg-yellow-200 animate-pulse text-black font-bold transform scale-110',
      correct: baseStyle + 'bg-green-500 text-white',
      incorrect: baseStyle + 'bg-red-200 text-red-800',
      waiting: baseStyle + 'hover:bg-gray-100'
    }

    return styles[word.status]
  }

  const getConfidenceStyle = (status: 'correct' | 'incorrect') => {
    const baseStyle = {
      position: 'absolute' as const,
      top: '-10px',
      right: '-10px',
      fontSize: '0.65em',
      padding: '2px 6px',
      borderRadius: '9999px', // Makes it fully rounded
      fontWeight: 'bold',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      minWidth: '32px',
      textAlign: 'center' as const,
      transform: 'scale(0.9)',
    }

    if (status === 'correct') {
      return {
        ...baseStyle,
        backgroundColor: '#22c55e', // Green
        color: 'white',
      }
    } else {
      return {
        ...baseStyle,
        backgroundColor: '#ef4444', // Red
        color: 'white',
      }
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg relative overflow-hidden">
      <CardContent className="p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(streak, 5) }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-yellow-400"
              >
                <Star className="w-6 h-6 fill-current" />
              </motion.div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Start Over
          </Button>
        </div>

        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/90 px-6 py-3 rounded-full shadow-lg text-2xl font-bold text-center z-10"
            >
              {feedback}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-3xl leading-relaxed text-center font-rounded">
          {words.map((word, index) => (
            <motion.span 
              key={index} 
              className={getWordStyle(word)}
              style={{
                cursor: 'pointer',
                display: 'inline-block',
                position: 'relative',
                margin: '0 4px'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {word.text}
              {!word.isPunctuation && " "}
              {word.status === 'current' && isListening && !word.isPunctuation && (
                <motion.span 
                  className="absolute -bottom-1 left-0 w-full h-1 bg-yellow-400"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
              {(word.status === 'correct' || word.status === 'incorrect') && !word.isPunctuation && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-3 right-0 text-xs px-2 py-1 rounded-full font-bold"
                  style={{
                    backgroundColor: word.status === 'correct' ? '#22c55e' : '#ef4444',
                    color: 'white',
                    fontSize: '0.65em'
                  }}
                >
                  {Math.round(word.confidence)}%
                </motion.span>
              )}
            </motion.span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}