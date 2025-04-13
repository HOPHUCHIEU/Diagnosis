export function trimStringFields<T>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj

  const trimmed = { ...obj }
  Object.keys(trimmed).forEach((key) => {
    if (typeof trimmed[key] === 'string') {
      trimmed[key] = trimmed[key].trim()
    }
  })
  return trimmed
}
