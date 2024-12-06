import React, { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { levenshteinDistance, levenshteinDistance2 } from '@/lib/calculateMatch';

interface Word {
  text: string;
  correct: boolean;
}

interface TextDisplayProps {
  textToRead: string;
  spokenText: string;
}



export default function TextDisplay({ textToRead = "Sample text", spokenText = "" }: TextDisplayProps) {
  const [words, setWords] = useState<Word[]>([])

  useEffect(() => {
    if (textToRead) {
      setWords(textToRead.split(' ').map(word => ({ text: word, correct: false })))
    }
  }, [textToRead])

  useEffect(() => {
    if (textToRead && spokenText) {
      const spokenWords = spokenText.toLowerCase().split(' ')
      const originalWords = textToRead.toLowerCase().split(' ')

      let spokenIndex = 0
      setWords(words => words.map((word, index) => {
        if (spokenIndex >= spokenWords.length) {
          return word
        }
        
        if (spokenWords[spokenIndex] === originalWords[index]) {
          spokenIndex++
          return { ...word, correct: true }
        } else {
          // Check for partial matches or small mistakes
          const originalWord = originalWords[index]
          const spokenWord = spokenWords[spokenIndex]
          
          if (levenshteinDistance2(originalWord, spokenWord) <= 2) {
            spokenIndex++
            return { ...word, correct: true }
          }
          
          // Word doesn't match, move to next spoken word
          spokenIndex++
        }
        
        return word
      }))
    }
  }, [spokenText, textToRead])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="text-lg font-medium mb-4" id="text-to-read">
          {words.map((word, index) => (
            <span 
              key={index} 
              className={`px-1 py-0.5 rounded ${word.correct ? 'bg-green-500 text-white' : ''}`}
            >
              {word.text}{' '}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}