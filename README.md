# FeelingMatch

Eine Web-App, die Menschen anonym anhand ihrer aktuellen Stimmung miteinander
verbindet, gebaut mit Vite + React und Supabase (Auth, Datenbank, Realtime).

**Live-Vorschau:** siehe Vercel-Projekt `feeling-match/app` (passwortgeschützt,
Passwort auf Anfrage). Jeder Push auf `main` deployed automatisch neu.

## Setup

```bash
npm install
npm run dev       # Entwicklungsserver, siehe angezeigte lokale URL
npm run build      # Produktions-Build nach dist/
npm run preview    # Build lokal testen
npm run lint
```

Voraussetzung: Node.js 18+ und npm, sowie ein Supabase-Projekt (siehe
"Datenbank & Auth (Supabase)" unten).

## Aktueller Stand

Login/Registrierung, Profile, Freundschaften, der Freunde-Chat und die
Stimmungs-Historie laufen über eine echte Datenbank (Supabase/Postgres) –
keine Fake-Daten mehr. Jede Stimmungsauswahl (Home, tägliches Check-in,
Gefühls-Check) wird dauerhaft in `mood_logs` gespeichert, sodass sich über
die Zeit ein echter Verlauf pro Person aufbaut. Pro Auswahlvorgang können
mehrere Gefühle gleichzeitig ausgewählt werden (z.B. gemischte Gefühle) –
geloggt wird jedes einzeln, angezeigt (Pille/Gruß/Ampel-Vorschlag) wird
immer das zuletzt gewählte. Logging ist bewusst unbegrenzt oft am Tag
möglich; XP werden trotzdem nur einmal pro Kalendertag vergeben, da sie an
den Profil-Status gekoppelt sind (`src/services/gamificationService.js`),
nicht an die Anzahl geloggter Emotionen. Beim ersten Öffnen von Home an
einem Tag fragt die App aktiv nach der aktuellen Stimmung
(`src/components/DailyMoodCheckin.jsx`).

Die Emotionen selbst kommen aus einer ~40 Einträge umfassenden Taxonomie
(`src/data/emotions.js`), aufgebaut auf Plutchiks "Wheel of Emotions" (8
Grundfamilien × 3 Intensitäten + 8 Mischgefühl-Dyaden) plus häufig gesuchten
Alltagsbegriffen – durchsuchbar und nach Familie filterbar
(`src/components/EmotionPicker.jsx`), einheitlich im "Alle Gefühle"-Modal
und im täglichen Check-in. Zusätzlich kann sich jede Person eigene
Emotionen anlegen (Name + Emoji + Ampel-Farbe, `custom_emotions`-Tabelle,
`src/services/customEmotionsService.js`) – bewusst ohne KI, bleiben aber für
künftige Auswahlen gespeichert.

Es gibt bewusst **keine KI-basierte Emotionserkennung**: Die einzige
"Diagnose" läuft über einen kurzen, indirekten Gefühls-Check
(`src/data/panas.js`, Funktionsname historisch, Inhalt kein PANAS mehr) –
statt Gefühlswörter direkt einzuschätzen ("wie sehr trifft 'interessiert'
zu?"), fragt er nach Körpergefühl, Energie, Gedanken und dem Rückblick auf
die letzten Stunden, jeweils als einfache Entweder-Oder-Entscheidung. Die
Antworten werden wie zuvor auf eine Position im Circumplex-Modell (Valenz ×
Aktivierung, Russell 1980) abgebildet und der nächstliegenden Emotion in der
Taxonomie zugeordnet.

Der anonyme "Match"-Flow (Home → Check-in → Match → Suche → Chat mit einem
zufälligen Partner) ist bewusst weiterhin eine Simulation ohne echtes
Matching-Backend.

## Datenbank & Auth (Supabase)

1. Kostenloses Projekt auf [supabase.com](https://supabase.com) anlegen.
2. Im Supabase Dashboard unter **SQL Editor** den kompletten Inhalt von
   `supabase/schema.sql` einfügen und ausführen (legt `profiles`,
   `friendships`, `messages`, `mood_logs`, `custom_emotions` inkl.
   Row-Level-Security und Realtime an).
3. Unter **Authentication → Providers → Email** die Option **"Confirm
   email"** deaktivieren, damit sich neue Nutzer:innen sofort einloggen
   können (sonst muss erst ein Bestätigungslink in der E-Mail angeklickt
   werden).
4. Unter **Project Settings → API** die **Project URL** und den
   **anon public key** kopieren und in `.env.local` eintragen (siehe
   `.env.example`) bzw. auf Vercel als Environment Variables anlegen.

## Architektur

```
src/
  main.jsx            Einstiegspunkt, bindet Router + Context-Provider ein
  App.jsx              Routen-Definition, Auth-Guard
  layout/AppLayout.jsx  Rahmen für eingeloggte Seiten (+ untere Navigation)
  pages/                Ein Screen pro Datei (Splash, Login, Home, Chat, ...)
  components/           Wiederverwendbare UI-Bausteine (Button, Card, ...)
  context/              React Context: Auth, Theme (Hell/Dunkel/Akzent), Mood
  services/             Zugriffsschicht auf Supabase (Auth, Freunde, Chat)
  data/                 Statische Inhalte (Emotionen, Gefühls-Check-Fragen ...)
  styles/                Design-Tokens (CSS-Variablen) + gemeinsame Klassen
supabase/
  schema.sql            Datenbankschema + RLS-Policies (siehe oben)
```

### Warum eine Service-Schicht?

Komponenten rufen nie direkt Supabase/`localStorage` auf, sondern immer über
`src/services/*.js` (`authService`, `friendsService`, `chatService`,
`moodService`) bzw. die Contexts, die sie kapseln (`useAuth()` in
`src/context/AuthContext.jsx`, `useMood()` in `src/context/MoodContext.jsx`).
Würde später z. B. der Datenbank-Anbieter wechseln, muss nur die jeweilige
Service-Datei ersetzt werden – die Rückgabeform (z. B. `{ id, displayName,
email, createdAt }` beim Nutzer) bleibt gleich, der Rest der App merkt davon
nichts.

## Zugriffsschutz (Vercel-Vorschau)

Da die live gehostete Version öffentlich erreichbar ist, aber nur eingeladene
Personen zugreifen sollen, liegt vor der App eine einfache Passwortsperre
(`src/components/PasswordGate.jsx`). Das ist **kein echter Sicherheitsschutz**
(das Passwort landet mit im Browser-Bundle), sondern hält nur Zufallsbesucher
fern. Passwort wird über `VITE_APP_PASSWORD` gesetzt:

- Lokal: `.env.local` (nicht eingecheckt, siehe `.env.example`)
- Auf Vercel: Project Settings → Environment Variables

Ist die Variable leer, ist die Sperre deaktiviert.

## Design

Farben, Schriftgrößen, Radien etc. stecken als CSS-Variablen in
`src/styles/theme.css` (inkl. Dark Mode und drei wählbaren Akzentfarben,
einstellbar unter Profil → Einstellungen → Darstellung). Der bisherige
Handy-Rahmen (Notch, Statusleiste mit Uhrzeit/Akku) wurde entfernt, da die
App jetzt ein normales responsives Webseiten-Layout ist – die Optik
(Farben, Karten, Buttons, Blob-Maskottchen, Animationen) wurde bewusst
beibehalten.

### Icons

UI-Chrome (Navigation, Einstellungen, Buttons, Badges) nutzt echte
SVG-Icons aus [`lucide-react`](https://lucide.dev) statt Emojis. Emojis
kommen nur noch dort vor, wo sie inhaltlich Emotionen ausdrücken (die
Stimmungs-Gesichter, Chat-Inhalte, anonyme Avatare) – das ist bewusstes
Gestaltungsmittel der App, kein UI-Element.

## Status, Ampel & Schmerzskala

Im Profil (`src/pages/ProfilePage.jsx`) kann jede Person einen kurzen Status
schreiben, sich manuell auf **Grün/Gelb/Rot** einschätzen ("wie sehr
brauche ich gerade Unterstützung", nicht automatisch aus der Stimmung
abgeleitet) und eine **0-10 Schmerz-/Belastungsskala** setzen. Freunde sehen
das in `FriendsPage.jsx` als farbigen Punkt + Statuszeile
(`friendsService.listFriends`/`getProfile`). Die Emotion-Kacheln im
`EmotionPicker` zeigen zusätzlich automatisch einen kleinen Ampel-Punkt,
abgeleitet aus der Valenz jeder Emotion (`ampelForValence` in
`data/emotions.js`) – zwei getrennte Ampel-Konzepte: eine bewusst gewählte
persönliche Einschätzung vs. eine aus der Taxonomie abgeleitete Einordnung.

**Bekannte Einschränkung:** Aus Zeitgründen ist die Sichtbarkeit von Status/
Schmerzskala nicht auf Freunde beschränkt (die `profiles`-Tabelle ist für
alle eingeloggten Nutzer:innen lesbar, aus Gründen der Namenssuche beim
Hinzufügen von Freunden). In der UI wird der Status aktuell nur im
Freundeskontext angezeigt, aber technisch könnte ihn jede eingeloggte
Person per direkter Abfrage auslesen. Für echten Datenschutz bräuchte es
eine differenziertere RLS-Policy (z. B. eine Postgres-Funktion, die auf
`friendships` prüft) statt der pauschalen "alle eingeloggten Nutzer"-Regel.

## Profilbilder

Im Profil kann man aus 12 vorgefertigten Avatar-Bildern wählen
(`src/data/avatars.js`, Dateien in `public/avatars/`, Original-Auflösung
lokal unter `estados-fotos/` – nicht eingecheckt). Kein Bild-Upload, nur
Auswahl aus fester Liste (kein Speicher-/Moderationsaufwand). Das gewählte
Bild erscheint im eigenen Profil, in der Freundesliste, den
Status-Sprechblasen und im Freundes-Chat (`AvatarCircle.jsx`, fällt ohne
gewähltes Bild auf den ersten Buchstaben des Anzeigenamens zurück).

### Gamification: Avatare freischalten

Die Avatare sind anfangs gesperrt (`gamificationService.js`):

- Der **erste** wird per Zufall gewonnen ("verdeckte Karte aufdecken").
- Jeder weitere Kalendertag, an dem der Profil-Status gespeichert wird,
  gibt XP (`XP_PER_STATUS_DAY`); ab genug XP schaltet der nächste Avatar in
  fester Reihenfolge frei (`XP_PER_AVATAR`).
- Aktuell bewusst auf ein **schnelles Test-Tempo** gestellt (alle ~3
  Status-Tage ein neuer Avatar). Für die ursprünglich angedachte Kadenz
  ("12 Monate, an 50% der Tage Status gegeben") einfach `DAYS_PER_AVATAR`
  in `gamificationService.js` auf `Math.round(365 * 0.5 / 11)` (≈ 17)
  hochsetzen.
- Freischalt-Fortschritt liegt in `profiles.xp` / `profiles.unlocked_avatars`,
  RLS-mäßig genauso abgesichert wie der Rest des Profils.

## Nächste sinnvolle Schritte

- Echtes Matching statt Zufalls-/Fake-Partner ("Stiller Mond") im
  anonymen Flow – ggf. ebenfalls über `friendships`/`messages`-artige
  Tabellen.
- Freitext-Eingabe mit KI-gestützter Analyse als **optionales
  Zusatzfeature** (bewusst nicht als alleinige Diagnose-Quelle) – noch zu
  besprechen, wie das neben dem Fragebogen aussehen soll.
- Den einfachen 3-Fragen-Check-in (`CheckinPage.jsx`, "Jemanden finden"-Flow)
  leitet aktuell noch keine Stimmung aus den Antworten ab, im Unterschied
  zum Gefühls-Check.
