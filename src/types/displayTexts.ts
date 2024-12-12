export type DifficultyLevel = 'beginner' | 'learning' | 'expert'

interface DisplayTexts {
  beginner: string[]
  learning: string[]
  expert: string[]
}

// Feedback messages for different scenarios
export const feedbackMessages = {
  great: [
    "Amazing! ",
    "Fantastic job! ",
    "You're a star! ",
    "Keep it up! ",
    "Wonderful! "
  ],
  good: [
    "Good try! ",
    "Almost there! ",
    "Keep going! ",
    "You can do it! ",
    "Nice effort! "
  ]
}

export const displayTexts: DisplayTexts = {
  beginner: [
    'A B C D E F G H I J K L M N O P Q R S T U V W X Y Z',
    'Z Y X W V U T S R Q P O N M L K J I H G F E D C B A',
    '1 2 3 4 5 6 7 8 9 10',
    'A E I O U',
  ],
  learning: [
    'Apple Ball Cat Dog Elephant Fish Game House Ice Juice King Lion Moon Nest Orange Pen Queen Rain Sun Tree Umbrella Van Water Xray Yellow Zoo',
    'Book Chair Door Eye Face Girl Hat Island Jump Kite Lamp Map Night Ocean Park Queen Room Star Time Up Van Wind Box Year Zebra',
    'Red Blue Green Yellow Pink Purple Orange Black White Brown',
    'One Two Three Four Five Six Seven Eight Nine Ten',
  ],
  expert: [
    'The quick brown fox jumps over the lazy dog.',
    'She sells seashells by the seashore.',
    'How much wood would a woodchuck chuck if a woodchuck could chuck wood?',
    'Peter Piper picked a peck of pickled peppers.',
    'Today is a beautiful day to learn and practice reading.',
    'The sun is shining brightly in the clear blue sky.',
    'Reading helps us learn new things and explore different worlds.',
    'Practice makes perfect, keep up the good work!',
    'Every day is a new opportunity to improve our reading skills.',
    'Learning to read is fun and exciting.',
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "Be the change you wish to see in the world.",
    "Every accomplishment starts with the decision to try.",
    "The only way to do great work is to love what you do.",
    "Believe you can and you're halfway there.",
    "Life is what happens while you're busy making other plans."
  ]
}

// Helper function to get text by difficulty and index
export const getTextByDifficulty = (
  difficulty: DifficultyLevel,
  index: number,
  customText?: string
): string => {
  const texts = displayTexts[difficulty]
  // For expert level, use custom text only if it's not the default
  if (difficulty === 'expert') {
    if (customText && customText !== 'Sample text') {
      return customText
    }
    // Otherwise use predefined expert texts
    return texts[index % texts.length]
  }
  return texts[index % texts.length]
}

// Get the total number of texts for a difficulty level
export const getTextCount = (difficulty: DifficultyLevel): number => {
  return displayTexts[difficulty].length
}
