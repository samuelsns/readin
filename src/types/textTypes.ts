// Difficulty levels for the reading app
export type DifficultyLevel = 'beginner' | 'intermediate' | 'expert'

// Word status in the display
export type WordStatus = 'waiting' | 'current' | 'correct' | 'incorrect'

// Individual word interface
export interface Word {
  text: string;
  status: 'waiting' | 'current' | 'correct' | 'incorrect';
  confidence: number;
  isPunctuation: boolean;
}

// Props for TextDisplay component
export interface TextDisplayProps {
  textToRead: string;
  spokenText: string;
  isListening?: boolean;
  difficulty?: DifficultyLevel;
}

// Props for ReadingComponent
export interface ReadingComponentProps {
  textToRead?: string;
}

// Props for MicControl component
export interface MicrophoneControlProps {
  onSpeechResult: (text: string) => void;
  onListeningChange: (isListening: boolean) => void;
}

// Props for DifficultySelector component
export interface DifficultySelectorProps {
  currentDifficulty: DifficultyLevel;
  onDifficultyChange: (difficulty: DifficultyLevel) => void;
}
