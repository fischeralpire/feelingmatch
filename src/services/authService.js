// Echte Authentifizierung über Supabase (E-Mail + Passwort). Ersetzt die
// frühere Mock-Version, die localStorage genutzt hat. Die öffentliche Form
// des Nutzer-Objekts { id, displayName, email, createdAt } bleibt bewusst
// gleich, damit AuthContext und alle Komponenten unverändert weiterlaufen.
import { supabase } from './supabaseClient'

const listeners = new Set()

function mapUser(session) {
  if (!session?.user) return null
  const { user } = session
  return {
    id: user.id,
    displayName: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Nutzer',
    email: user.email,
    createdAt: user.created_at,
  }
}

function translateAuthError(error) {
  const msg = error?.message || ''
  if (msg.includes('Invalid login credentials')) return 'E-Mail oder Passwort ist falsch.'
  if (msg.includes('already registered') || msg.includes('already exists')) {
    return 'Für diese E-Mail existiert bereits ein Konto.'
  }
  if (msg.includes('Password should be at least')) return 'Das Passwort muss mindestens 6 Zeichen haben.'
  if (msg.includes('Unable to validate email address')) return 'Das ist keine gültige E-Mail-Adresse.'
  return msg || 'Etwas ist schiefgelaufen. Bitte versuch es erneut.'
}

supabase.auth.onAuthStateChange((_event, session) => {
  const user = mapUser(session)
  listeners.forEach((callback) => callback(user))
})

export const authService = {
  async getSession() {
    const { data } = await supabase.auth.getSession()
    return mapUser(data.session)
  },

  async login({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(translateAuthError(error))
    return mapUser(data.session)
  },

  // "Passwort vergessen"-Ausweg: schickt einen Magic Link statt eines
  // Passwort-Reset-Formulars – der Klick auf den Link loggt direkt ein
  // (kein neues Passwort nötig). Landet auf /login, wo RedirectIfAuthenticated
  // (App.jsx) automatisch zu /home weiterleitet, sobald supabase-js die
  // Session aus dem Link-Hash übernommen hat.
  async sendMagicLink(email) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/login` },
    })
    if (error) throw new Error(translateAuthError(error))
  },

  async register({ email, password, displayName, age, gender }) {
    if (!displayName?.trim()) throw new Error('Bitte gib einen Anzeigenamen ein.')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName.trim(),
          age: age ? Number(age) : null,
          gender: gender || 'keine_angabe',
        },
      },
    })
    if (error) throw new Error(translateAuthError(error))
    if (!data.session) {
      throw new Error('Konto erstellt – bitte bestätige deine E-Mail-Adresse und logge dich dann ein.')
    }
    return mapUser(data.session)
  },

  // Gast-Zugang ohne Registrierung (siehe SplashPage): legt eine echte,
  // aber pseudonyme Supabase-Session an. RLS, Matching, Freunde etc. laufen
  // unverändert weiter, weil auth.uid() ganz normal existiert – nur gibt es
  // kein Passwort/keine E-Mail, um später wieder in genau diesen Account zu
  // kommen. Setzt voraus, dass "Anonymous Sign-Ins" im Supabase-Projekt
  // aktiviert ist.
  async continueAsGuest() {
    const { data, error } = await supabase.auth.signInAnonymously()
    if (error) throw new Error(translateAuthError(error))
    return mapUser(data.session)
  },

  async logout() {
    await supabase.auth.signOut()
  },

  // Erlaubt Komponenten, auf Login/Logout aus anderen Tabs/Stellen zu reagieren.
  subscribe(callback) {
    listeners.add(callback)
    return () => listeners.delete(callback)
  },
}
