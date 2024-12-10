import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { levenshteinDistance2 } from '@/lib/calculateMatch'

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

export default function TextDisplay({ 
  textToRead = "Sample text", 
  spokenText = "",
  isListening = false 
}: TextDisplayProps) {
  // State Management
  const [words, setWords] = useState<Word[]>([])
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0)
  const [lastProcessedText, setLastProcessedText] = useState("")

  // Utility Functions
  const isPunctuation = useCallback((word: string) => (
    /^[.!?,]+$/.test(word.trim())
  ), [])

  const normalizeText = useCallback((text: string) => (
    text.toLowerCase()
      .replace(/[^a-z0-9\s.!?,]/g, '')
      .replace(/([.!?,])/g, ' $1')
      .replace(/\s+/g, ' ')
      .trim()
  ), [])

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

      const distance = levenshteinDistance2(
        normalizeText(currentWord.text),
        normalizeText(currentSpokenWord)
      )
      const confidence = Math.max(0, 100 - (distance * 33.33))

      if (distance <= 1) {
        currentWord.status = 'correct'
        currentWord.confidence = confidence
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

  // Styling
  const getWordStyle = (word: Word) => {
    const baseStyle = 'px-2 py-1 rounded-lg mx-1 transition-all duration-300 '
    
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

  // Render
  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardContent className="p-8">
        <div className="text-2xl leading-relaxed font-comic-sans space-y-4">
          {words.map((word, index) => (
            <span 
              key={index} 
              className={getWordStyle(word)}
              style={{
                cursor: 'pointer',
                display: 'inline-block',
                position: 'relative'
              }}
            >
              {word.text}
              {word.status === 'current' && isListening && !word.isPunctuation && (
                <span className="absolute -bottom-1 left-0 w-full h-1 bg-yellow-400 animate-pulse" />
              )}
              {(word.status === 'correct' || word.status === 'incorrect') && !word.isPunctuation && (
                <span className="absolute -top-2 right-0 text-xs" style={{ fontSize: '0.6em' }}>
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