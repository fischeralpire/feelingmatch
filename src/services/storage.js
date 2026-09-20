// Dünner Wrapper um localStorage. Zentrale Stelle, falls Speicherung später
// z.B. gegen IndexedDB oder einen Server-Sync ausgetauscht wird.
const PREFIX = 'feelingmatch:'

export function readValue(key, fallback = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function writeValue(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // localStorage kann in privaten Tabs/Storage-Limits fehlschlagen – Absturz vermeiden.
  }
}

export function removeValue(key) {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    // ignorieren
  }
}
