// Abwechslungsreiche Begrüßungen für die Startseite, damit es sich nicht bei
// jedem Login gleich anfühlt. {name} wird durch den Anzeigenamen ersetzt.
export const GREETINGS = [
  'Schön, dich zu sehen, {name}.',
  'Hey {name}, schön dass du da bist.',
  'Willkommen zurück, {name}.',
  'Hallo {name}, wie schön dich zu sehen.',
  'Hi {name}! Gut, dass du vorbeischaust.',
  '{name}, schön dass du wieder hier bist.',
  'Willkommen, {name} – schön, dich zu sehen.',
  'Hey {name}, gut dich zu sehen.',
  'Schön, dass du reinschaust, {name}.',
  'Hallo {name}, wir haben dich vermisst.',
  'Willkommen zurück in deinem Raum, {name}.',
  '{name}, schön, dass du dir Zeit nimmst.',
  'Hi {name}, schön dich zu sehen.',
  'Gut, dass du da bist, {name}.',
  'Hallo {name}! Schön, dich wiederzusehen.',
  'Willkommen, {name}.',
  'Hey {name}, schön dich zu sehen.',
  'Da bist du ja, {name} – schön.',
  'Hallo {name}, komm gut an.',
  'Schön dich zu sehen, {name}. Nimm dir einen Moment.',
  'Hi {name}, willkommen zurück.',
  '{name}! Schön, dass du da bist.',
  'Hallo {name}, atme kurz durch – du bist da.',
  'Willkommen zurück, {name}. Schön, dass du dir Zeit für dich nimmst.',
  'Hey {name}, gut dass du wieder vorbeischaust.',
  'Hallo {name}, ein neuer Moment für dich.',
  'Schön, dass du hier bist, {name}.',
  'Hi {name}, willkommen in deinem Raum.',
  'Hallo {name}. Schön, dich zu sehen.',
  '{name}, schön dass du da bist – nimm dir Zeit.',
  'Willkommen zurück, {name}. Wie geht es dir gerade?',
  'Hey {name}, schön dich wiederzusehen.',
  'Hallo {name}, gut dass du da bist.',
  'Schön dich zu sehen, {name} – wie fühlst du dich?',
  'Hi {name}, schön dass du zurück bist.',
  'Willkommen, {name}. Dein Moment beginnt jetzt.',
  'Hallo {name}, schön dass du dir diesen Moment nimmst.',
  'Hey {name}, gut dass du reinschaust.',
  'Schön, dich wiederzusehen, {name}.',
  '{name}, willkommen zurück.',
]

export function getRandomGreeting(name) {
  const template = GREETINGS[Math.floor(Math.random() * GREETINGS.length)]
  return template.replace('{name}', name)
}
