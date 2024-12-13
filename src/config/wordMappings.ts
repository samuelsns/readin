// Map of similar-sounding words for better word matching
export const similarSoundingWords: { [key: string]: string[] } = {
  'fun': ['fan'],
  'fan': ['fun'],
  'aloud': ['allowed'],
  'allowed': ['aloud'],
  'there': ['their', "they're"],
  'their': ['there', "they're"],
  "they're": ['there', 'their']
}

// Feedback messages for different scenarios
export const feedbackMessages = {
  correct: ['Great job! 🌟', 'Perfect! 🎯', 'Excellent! ⭐', 'Amazing! 🌈', 'Wonderful! 🎨'],
  incorrect: ['Try again! 🎯', 'Almost there! 🌟', 'Keep going! 🌈', 'You can do it! ⭐'],
  completed: ['Congratulations! 🎉', 'Well done! 🌟', 'Fantastic work! 🎨', 'You did it! 🎯']
}
