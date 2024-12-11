import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { levenshteinDistance2 } from '@/lib/calculateMatch'
import { Button } from "@/components/ui/button"
import { RotateCcw } from 'lucide-react'

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

export default function TextDisplay({ 
  textToRead = "Sample text", 
  spokenText = "",
  isListening = false 
}: TextDisplayProps) {
  // State Management
  const [words, setWords] = useState<Word[]>([])
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0)
  const [lastProcessedText, setLastProcessedText] = useState("")
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
      
      // Check for similar-sounding words
      const similarWords = similarSoundingWords[normalizedCurrentWord] || []
      const isSimilarSoundingWord = similarWords.includes(normalizedSpokenWord)

      const distance = levenshteinDistance2(normalizedCurrentWord, normalizedSpokenWord)
      const confidence = Math.max(0, 100 - (distance * 33.33))

      if (distance <= 1 || isSimilarSoundingWord) {
        currentWord.status = 'correct'
        currentWord.confidence = isSimilarSoundingWord ? 100 : confidence
        const nextIndex = moveToNextWord(newWords, currentWordIndex)
        setCurrentWordIndex(nextIndex)
      } else if (currentSpokenWord.length >= currentWord.text.length) {
        currentWord.status = 'incorrect'
        currentWord.confidence = confidence
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
    const baseStyle = 'px-3 py-2 rounded-lg mx-1 transition-all duration-300 relative '
    
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
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardContent className="p-8">
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>
        <div className="text-2xl leading-relaxed text-center">
          {words.map((word, index) => (
            <span 
              key={index} 
              className={getWordStyle(word)}
              style={{
                cursor: 'pointer',
                display: 'inline-block',
                position: 'relative',
                margin: '0 4px'
              }}
            >
              {word.text}
              {!word.isPunctuation && " "}
              {word.status === 'current' && isListening && !word.isPunctuation && (
                <span className="absolute -bottom-1 left-0 w-full h-1 bg-yellow-400 animate-pulse" />
              )}
              {(word.status === 'correct' || word.status === 'incorrect') && !word.isPunctuation && (
                <span style={getConfidenceStyle(word.status)}>
                  {Math.round(word.confidence)}%
                </span>
              )}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}