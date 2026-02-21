import { SentimentIntensityAnalyzer } from "vader-sentiment"

const KAOMOJIS = {
  very_positive: "\(>w<)/",
  positive: "(｡^‿^｡)",
  neutral: "(-w-)",
  negative: "(o.o)",
  very_negative: "(╥﹏╥)",
} as const

function resolve(score: number) {
  if (score >= 0.5) return KAOMOJIS.very_positive
  if (score >= 0.1) return KAOMOJIS.positive
  if (score > -0.1) return KAOMOJIS.neutral
  if (score > -0.5) return KAOMOJIS.negative
  return KAOMOJIS.very_negative
}

const THINKING_WEIGHT = 0.6
const TEXT_WEIGHT = 0.4

export function kaomoji(text: string, thinking?: string) {
  const textScore = text ? SentimentIntensityAnalyzer.polarity_scores(text).compound : 0
  if (!thinking) return resolve(textScore)
  const thinkingScore = SentimentIntensityAnalyzer.polarity_scores(thinking).compound
  return resolve(thinkingScore * THINKING_WEIGHT + textScore * TEXT_WEIGHT)
}
