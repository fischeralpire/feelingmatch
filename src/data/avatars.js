// Auswählbare Profilbilder (von der Nutzerin bereitgestellt, siehe
// public/avatars). Bewusst eine feste Auswahl statt Bild-Upload – kein
// Speicher-/Moderationsaufwand, passt zum "anonym & sicher"-Konzept der App.
export const AVATARS = Array.from({ length: 12 }, (_, i) => ({
  id: `emotion-${i + 1}`,
  url: `/avatars/emotion-${i + 1}.png`,
}))
