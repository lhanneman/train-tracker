function positiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback
}

export const consensusTimeWindowMinutes = positiveInteger(process.env.CONSENSUS_TIME_WINDOW_MINUTES, 5)
export const trainCrossingExpirationMinutes = positiveInteger(process.env.TRAIN_CROSSING_EXPIRATION_MINUTES, 10)
export const reportCooldownSeconds = positiveInteger(process.env.REPORT_COOLDOWN_SECONDS, 15)
