export function levenshteinDistance(a: string, b: string): number {
    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null))
  
    for (let i = 0; i <= a.length; i++) matrix[0][i] = i
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j
  
    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + substitutionCost
        )
      }
    }
  
    return matrix[b.length][a.length]
  }

  export function levenshteinDistance2(a: string, b: string): number {
    // Swap strings if b is shorter than a to ensure 'a' is always the shorter string
    if (b.length < a.length) [a, b] = [b, a];
  
    // Initialize the previous row of distances
    let prevRow = Array.from({ length: a.length + 1 }, (_, i) => i);
  
    for (let i = 0; i < b.length; i++) {
      // Initialize the current row of distances
      const currentRow = [i + 1];
  
      for (let j = 0; j < a.length; j++) {
        const insertCost = prevRow[j + 1] + 1;
        const deleteCost = currentRow[j] + 1;
        const substituteCost = prevRow[j] + (a[j] !== b[i] ? 1 : 0);
  
        currentRow.push(Math.min(insertCost, deleteCost, substituteCost));
      }
  
      // Set the newly calculated row as the previous row for the next iteration
      prevRow = currentRow;
    }
  
    // The last element of the last row contains the Levenshtein distance
    return prevRow[a.length];
  }
