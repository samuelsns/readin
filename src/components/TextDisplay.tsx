import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { levenshteinDistance2 } from '@/lib/calculateMatch'
import { Button } from "@/components/ui/button"
import { RotateCcw, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { DifficultyLevel, getTextByDifficulty, getTextCount, feedbackMessages } from '@/types/displayTexts'

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
  difficulty?: DifficultyLevel
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
  'hear': ['here'],
  'tree': ['three'],
  'three': ['tree']
}

export default function TextDisplay({ 
  textToRead = "Sample text", 
  spokenText = "",
  isListening = false,
  difficulty = 'expert'
}: TextDisplayProps) {
  // State Management
  const [words, setWords] = useState<Word[]>([])
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0)
  const [lastProcessedText, setLastProcessedText] = useState("")
  const [feedback, setFeedback] = useState<string>("")
  const [showFeedback, setShowFeedback] = useState(false)
  const [streak, setStreak] = useState(0)
  const [progress, setProgress] = useState(0)
  const [textIndex, setTextIndex] = useState(0)

  // Utility Functions
  const isPunctuation = useCallback((word: string) => (
    /^[.!?,]+$/.test(word.trim())
  ), [])

  // Word normalization helper
  const normalizeText = useCallback((text: string) => {
    // Handle number word conversion first
    const numberWords: { [key: string]: string } = {
      'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5',
      'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10'
    };
    
    let processedText = text.toLowerCase();
    if (numberWords[processedText]) {
      processedText = numberWords[processedText];
    }
    
    // Apply existing text normalization
    return processedText
      .replace(/[^a-z0-9\s.!?,]/g, '')
      .replace(/([.!?,])/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();
  }, []);

  // Get the appropriate text based on difficulty
  const getDisplayText = useCallback(() => {
    return getTextByDifficulty(difficulty, textIndex)
  }, [difficulty, textIndex])

  // Handle text swap
  const handleSwapText = useCallback(() => {
    const maxTexts = getTextCount(difficulty)
    setTextIndex(prev => (prev + 1) % maxTexts)
    setWords([])
    setCurrentWordIndex(0)
    setLastProcessedText("")
    setStreak(0)
    setProgress(0)
  }, [difficulty])

  // Reset Function
  const handleReset = useCallback(() => {
    const cleanText = normalizeText(getDisplayText());
    const initialWords = cleanText.split(' ').map(word => ({
      text: word,
      status: 'waiting',
      confidence: 0,
      isPunctuation: isPunctuation(word)
    }));

    const firstWordIndex = initialWords.findIndex(word => !word.isPunctuation);
    if (firstWordIndex !== -1) {
      initialWords[firstWordIndex].status = 'current';
    }

    setWords(initialWords);
    setCurrentWordIndex(firstWordIndex !== -1 ? firstWordIndex : 0);
    setStreak(0);
    setProgress(0); // Reset progress bar when starting over
  }, [getDisplayText, normalizeText, isPunctuation]);

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
    if (!getDisplayText() || !spokenText || !isListening || spokenText === lastProcessedText) return;
    
    setLastProcessedText(spokenText);
    const cleanSpokenText = normalizeText(spokenText);
    const spokenWords = cleanSpokenText.split(' ');
    const currentSpokenWord = spokenWords[spokenWords.length - 1];

    if (!currentSpokenWord) return;

    setWords(prevWords => {
      const newWords = [...prevWords];
      const currentWord = prevWords[currentWordIndex];

      if (!currentWord || currentWord.status === 'correct' || currentWord.isPunctuation) {
        return prevWords;
      }

      const normalizedCurrentWord = normalizeText(currentWord.text);
      const normalizedSpokenWord = normalizeText(currentSpokenWord);
      
      if (difficulty === 'beginner') {
        // Strict matching for beginner level only
        const isExactMatch = normalizedCurrentWord === normalizedSpokenWord;
        const confidence = isExactMatch ? 100 : 0;

        if (isExactMatch) {
          currentWord.status = 'correct';
          currentWord.confidence = confidence;
          const nextIndex = moveToNextWord(newWords, currentWordIndex);
          setCurrentWordIndex(nextIndex);
          setStreak(prev => prev + 1);
          
          // Update progress only for correct words
          const correctCount = newWords.filter(w => w.status === 'correct').length;
          const totalCount = newWords.filter(w => !w.isPunctuation).length;
          setProgress((correctCount / totalCount) * 100);
          
          if (streak >= 2) {
            showRandomFeedback(true);
          }
        } else if (currentSpokenWord.length >= 1) {
          currentWord.status = 'incorrect';
          currentWord.confidence = 0;
          setStreak(0);
          showRandomFeedback(false);
        }
      } else {
        // Flexible matching for learning and expert levels
        const similarWords = similarSoundingWords[normalizedCurrentWord] || [];
        const isSimilarSoundingWord = similarWords.includes(normalizedSpokenWord);

        const distance = levenshteinDistance2(normalizedCurrentWord, normalizedSpokenWord);
        const confidence = Math.max(0, 100 - (distance * 33.33));

        if (distance <= 1 || isSimilarSoundingWord) {
          currentWord.status = 'correct';
          currentWord.confidence = isSimilarSoundingWord ? 100 : confidence;
          const nextIndex = moveToNextWord(newWords, currentWordIndex);
          setCurrentWordIndex(nextIndex);
          setStreak(prev => prev + 1);
          
          // Update progress only for correct words
          const correctCount = newWords.filter(w => w.status === 'correct').length;
          const totalCount = newWords.filter(w => !w.isPunctuation).length;
          setProgress((correctCount / totalCount) * 100);
          
          if (streak >= 2) {
            showRandomFeedback(true);
          }
        } else if (currentSpokenWord.length >= currentWord.text.length) {
          currentWord.status = 'incorrect';
          currentWord.confidence = confidence;
          setStreak(0);
          showRandomFeedback(false);
        } else {
          currentWord.status = 'current';
          currentWord.confidence = confidence;
        }
      }

      return newWords;
    });
  }, [spokenText, isListening, currentWordIndex, normalizeText, moveToNextWord, difficulty]);

  // Reset progress when changing text
  useEffect(() => {
    if (!getDisplayText()) return;

    const cleanText = normalizeText(getDisplayText());
    const initialWords = cleanText.split(' ').map(word => ({
      text: word,
      status: 'waiting',
      confidence: 0,
      isPunctuation: isPunctuation(word)
    }));

    const firstWordIndex = initialWords.findIndex(word => !word.isPunctuation);
    if (firstWordIndex !== -1) {
      initialWords[firstWordIndex].status = 'current';
    }

    setWords(initialWords);
    setCurrentWordIndex(firstWordIndex !== -1 ? firstWordIndex : 0);
    setLastProcessedText("");
    setProgress(0); // Reset progress when text changes
  }, [getDisplayText, normalizeText, isPunctuation]);

  return (
    <div className="relative">
      <Card className="shadow-sm">
        <CardContent className="p-4">
          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-sm"
            >
              <RotateCcw className="w-4 h-4 mr-1" /> Start Over
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSwapText}
              className="text-sm"
            >
              <Star className="w-4 h-4 mr-1" /> Next Text ({textIndex + 1}/{getTextCount(difficulty)})
            </Button>
          </div>

          {/* Display Text Area */}
          <div className="min-h-[150px] flex items-center justify-center">
            <div className="text-2xl md:text-3xl leading-relaxed tracking-wide font-medium">
              {words.map((word, index) => (
                <motion.span
                  key={`${word.text}-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`inline-block mx-2 ${
                    word.status === 'current' ? 'bg-yellow-200 rounded px-2 py-0.5 animate-pulse' :
                    word.status === 'correct' ? 'text-green-600' :
                    word.status === 'incorrect' ? 'text-red-600' :
                    ''
                  }`}
                >
                  {word.text}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          {progress > 0 && (
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-6">
              <motion.div
                className="bg-blue-600 h-1.5 rounded-full"
                style={{ width: `${progress}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feedback Message */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-md text-lg font-medium text-center z-10 whitespace-nowrap"
          >
            {feedback}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}