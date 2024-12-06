import { levenshteinDistance, levenshteinDistance2 } from './calculateMatch';

describe('Levenshtein Distance', () => {
  it('should return 0 for identical strings', () => {
    expect(levenshteinDistance('hello', 'hello')).toBe(0);
    expect(levenshteinDistance2('hello', 'hello')).toBe(0);
  });

  it('should return the correct distance for strings with insertions', () => {
    expect(levenshteinDistance('hello', 'helloworld')).toBe(5);
    expect(levenshteinDistance2('hello', 'helloworld')).toBe(5);
  });

  it('should return the correct distance for strings with deletions', () => {
    expect(levenshteinDistance('helloworld', 'hello')).toBe(5);
    expect(levenshteinDistance2('helloworld', 'hello')).toBe(5);
  });

  it('should return the correct distance for strings with substitutions', () => {
    expect(levenshteinDistance('hello', 'jello')).toBe(1);
    expect(levenshteinDistance2('hello', 'jello')).toBe(1);
  });

  it('should return the correct distance for strings with a mix of operations', () => {
    expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
    expect(levenshteinDistance2('kitten', 'sitting')).toBe(3);
  });

  it('should handle empty strings correctly', () => {
    expect(levenshteinDistance('', '')).toBe(0);
    expect(levenshteinDistance2('', '')).toBe(0);
    expect(levenshteinDistance('hello', '')).toBe(5);
    expect(levenshteinDistance2('hello', '')).toBe(5);
    expect(levenshteinDistance('', 'hello')).toBe(5);
    expect(levenshteinDistance2('', 'hello')).toBe(5);
  });
});
