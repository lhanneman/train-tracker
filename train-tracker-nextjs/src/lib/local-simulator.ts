export function localSimulatorEnabled() {
  if (process.env.NODE_ENV !== 'development' || process.env.ENABLE_LOCAL_SIMULATOR !== 'true') return false
  try {
    const database = new URL(process.env.DATABASE_URL ?? '')
    return ['localhost', '127.0.0.1', '[::1]'].includes(database.hostname)
  } catch {
    return false
  }
}
