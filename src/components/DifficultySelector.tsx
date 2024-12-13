import React from 'react'
import { Button } from "@/components/ui/button"
import { Star } from 'lucide-react'

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
    <div className="flex justify-center gap-1 mb-6 max-w-full px-2">
      <Button
        variant={currentDifficulty === 'beginner' ? 'default' : 'outline'}
        onClick={() => onDifficultyChange('beginner')}
        className={`h-9 px-2.5 text-sm whitespace-nowrap border-0 shadow-none ${
          currentDifficulty === 'beginner' 
            ? 'bg-[#14162c] hover:bg-[#14162c]/90' 
            : ''
        }`}
      >
        <Star className="w-3.5 h-3.5 mr-1 text-yellow-400 shrink-0" />
        Beginner
      </Button>
      <Button
        variant={currentDifficulty === 'learning' ? 'default' : 'outline'}
        onClick={() => onDifficultyChange('learning')}
        className={`h-9 px-2.5 text-sm whitespace-nowrap border-0 shadow-none ${
          currentDifficulty === 'learning'
            ? 'bg-[#14162c] hover:bg-[#14162c]/90'
            : ''
        }`}
      >
        <Star className="w-3.5 h-3.5 mr-1 text-blue-400 shrink-0" />
        Learning
      </Button>
      <Button
        variant={currentDifficulty === 'expert' ? 'default' : 'outline'}
        onClick={() => onDifficultyChange('expert')}
        className={`h-9 px-2.5 text-sm whitespace-nowrap border-0 shadow-none ${
          currentDifficulty === 'expert'
            ? 'bg-[#14162c] hover:bg-[#14162c]/90'
            : ''
        }`}
      >
        <Star className="w-3.5 h-3.5 mr-1 text-purple-400 shrink-0" />
        Expert
      </Button>
    </div>
  )
}
