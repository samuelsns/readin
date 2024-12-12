import React from 'react'
import { Button } from "@/components/ui/button"
import { Star, Sparkles, Zap } from 'lucide-react'

export type Difficulty = 'beginner' | 'learning' | 'expert'

interface DifficultySelectorProps {
  currentDifficulty: Difficulty
  onDifficultyChange: (difficulty: Difficulty) => void
}

export default function DifficultySelector({
  currentDifficulty,
  onDifficultyChange
}: DifficultySelectorProps) {
  return (
    <div className="flex justify-center gap-4 mb-6">
      <Button
        variant={currentDifficulty === 'beginner' ? 'default' : 'outline'}
        size="lg"
        onClick={() => onDifficultyChange('beginner')}
        className="flex items-center gap-2 text-lg font-bold transition-all hover:scale-105"
      >
        <Star className="w-5 h-5 text-yellow-400" />
        Beginner
      </Button>
      <Button
        variant={currentDifficulty === 'learning' ? 'default' : 'outline'}
        size="lg"
        onClick={() => onDifficultyChange('learning')}
        className="flex items-center gap-2 text-lg font-bold transition-all hover:scale-105"
      >
        <Sparkles className="w-5 h-5 text-blue-400" />
        Learning
      </Button>
      <Button
        variant={currentDifficulty === 'expert' ? 'default' : 'outline'}
        size="lg"
        onClick={() => onDifficultyChange('expert')}
        className="flex items-center gap-2 text-lg font-bold transition-all hover:scale-105"
      >
        <Zap className="w-5 h-5 text-purple-400" />
        Expert
      </Button>
    </div>
  )
}
