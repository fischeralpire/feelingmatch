import { useTheme } from '../context/ThemeContext'

// Die weiße "Feeling"-Schrift im dunklen Logo wäre auf hellem Grund
// unsichtbar, daher zwei Varianten statt eines CSS-Filters.
export function useLogoSrc() {
  const { mode } = useTheme()
  return mode === 'dark' ? '/logo-full-dark.png' : '/logo-full.png'
}
