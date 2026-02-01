/**
 * Fuzzy matching algorithm similar to Frappe's fuzzy_match.js
 * Implements a scoring system for fuzzy string matching
 */

export interface FuzzyMatchResult {
  match: boolean
  score: number
  matchedIndices: number[]
}

/**
 * Performs fuzzy matching on a string against a pattern
 * Returns [matched, score, matchedIndices]
 */
export function fuzzyMatch(
  pattern: string,
  text: string,
  returnMatches = false
): [boolean, number, number[]] {
  if (!pattern || !text) {
    return pattern === text ? [true, 1, []] : [false, 0, []]
  }

  const patternLen = pattern.length
  const textLen = text.length

  if (patternLen > textLen) {
    return [false, 0, []]
  }

  const matches: number[] = []
  let patternIndex = 0
  let score = 0
  let consecutiveMatches = 0

  // Convert to lowercase for comparison
  const patternLower = pattern.toLowerCase()
  const textLower = text.toLowerCase()

  for (let i = 0; i < textLen; i++) {
    const textChar = textLower[i]
    const patternChar = patternLower[patternIndex]

    if (textChar === patternChar) {
      matches.push(i)
      patternIndex++

      // Boost score for consecutive matches
      consecutiveMatches++
      score += 10 + consecutiveMatches
    } else {
      consecutiveMatches = 0
    }
  }

  const matched = patternIndex === patternLen

  if (matched) {
    // Boost score for early matches
    score += (textLen - patternLen) * 0.5

    // Additional boost for matches at word boundaries
    if (pattern.length > 0 && text[0].toLowerCase() === pattern[0].toLowerCase()) {
      score += 100
    }

    // Boost for matches after underscores or spaces
    matches.forEach((idx) => {
      if (idx > 0 && (text[idx - 1] === '_' || text[idx - 1] === ' ')) {
        score += 50
      }
    })
  }

  return returnMatches ? [matched, score, matches] : [matched, score, []]
}

/**
 * Marks matched indices in a string with HTML tags
 */
export function getMarkedString(text: string, matchedIndices: number[]): string {
  if (!matchedIndices.length) {
    return text
  }

  const matchArray = Array(text.length).fill(0)
  matchedIndices.forEach((idx) => {
    if (idx < text.length) {
      matchArray[idx] = 1
    }
  })

  let markedString = ''
  let buffer = ''

  const flushBuffer = () => {
    if (!buffer) return ''
    const temp = `<mark>${buffer}</mark>`
    buffer = ''
    return temp
  }

  matchArray.forEach((isMatch, index) => {
    if (isMatch) {
      buffer += text[index]
    } else {
      markedString += flushBuffer()
      markedString += text[index]
    }
  })
  markedString += flushBuffer()

  return markedString
}

/**
 * Performs fuzzy search with marking
 */
export function fuzzySearchWithMarking(
  pattern: string,
  text: string
): { matched: boolean; score: number; markedString: string } {
  const [matched, score, matches] = fuzzyMatch(pattern, text, true)

  return {
    matched,
    score,
    markedString: matched ? getMarkedString(text, matches) : text
  }
}
