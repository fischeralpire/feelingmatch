// End-to-End-Check des Freunde/Chat-Flows gegen die echte Supabase-Instanz:
// zwei Test-Accounts registrieren, Freundschaftsanfrage senden, annehmen,
// Nachricht schreiben, lesen. Nutzt keine Testframework-Mocks – prüft
// wirklich Auth + RLS-Policies aus supabase/schema.sql.
//
// Aufruf: node scripts/verify-supabase.mjs
// Liest VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY aus .env.local und
// TEST_EMAIL (eine echte, dir gehörende Adresse, z.B. deine@gmail.com –
// wir hängen per "+alias" Testkennungen an) aus der Umgebung.
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

function loadEnvLocal() {
  try {
    const content = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    for (const line of content.split('\n')) {
      const match = line.match(/^([A-Z_]+)=(.*)$/)
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2]
    }
  } catch {
    // .env.local optional, falls Variablen schon anders gesetzt sind
  }
}

loadEnvLocal()

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY
const testEmail = process.env.TEST_EMAIL

if (!url || !key) {
  console.error('❌ VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY fehlen (siehe .env.local).')
  process.exit(1)
}
if (!testEmail || !testEmail.includes('@')) {
  console.error('❌ Bitte TEST_EMAIL setzen, z.B.: TEST_EMAIL=deine@gmail.com node scripts/verify-supabase.mjs')
  process.exit(1)
}

const [localPart, domain] = testEmail.split('@')
const stamp = Date.now()
const userA = { email: `${localPart}+testA${stamp}@${domain}`, password: 'testpass123', displayName: `TestA${stamp}` }
const userB = { email: `${localPart}+testB${stamp}@${domain}`, password: 'testpass123', displayName: `TestB${stamp}` }

function client() {
  return createClient(url, key)
}

async function signUp(c, u) {
  const { data, error } = await c.auth.signUp({
    email: u.email,
    password: u.password,
    options: { data: { display_name: u.displayName } },
  })
  if (error) throw new Error(`signUp(${u.email}): ${error.message}`)
  if (!data.session) throw new Error(`signUp(${u.email}): kein Session zurückgegeben – ist "Confirm email" wirklich aus?`)
  return data.session.user.id
}

async function main() {
  const clientA = client()
  const clientB = client()

  console.log('1) Registriere Test-User A und B ...')
  const idA = await signUp(clientA, userA)
  const idB = await signUp(clientB, userB)
  console.log('   OK:', idA, idB)

  console.log('2) A sucht B per Anzeigename ...')
  const { data: found, error: searchErr } = await clientA
    .from('profiles')
    .select('id, display_name')
    .ilike('display_name', `%${userB.displayName}%`)
  if (searchErr) throw new Error(`search: ${searchErr.message}`)
  if (!found.length) throw new Error('search: B wurde nicht gefunden (profiles-Trigger/RLS prüfen)')
  console.log('   OK:', found)

  console.log('3) A sendet Freundschaftsanfrage an B ...')
  const { data: friendship, error: reqErr } = await clientA
    .from('friendships')
    .insert({ requester_id: idA, addressee_id: idB })
    .select()
    .single()
  if (reqErr) throw new Error(`friend request: ${reqErr.message}`)
  console.log('   OK:', friendship.id)

  console.log('4) B sieht die Anfrage und nimmt sie an ...')
  const { data: incoming, error: incErr } = await clientB
    .from('friendships')
    .select('id')
    .eq('status', 'pending')
    .eq('addressee_id', idB)
  if (incErr) throw new Error(`incoming: ${incErr.message}`)
  if (!incoming.length) throw new Error('incoming: B sieht keine offene Anfrage')
  const { error: acceptErr } = await clientB.from('friendships').update({ status: 'accepted' }).eq('id', incoming[0].id)
  if (acceptErr) throw new Error(`accept: ${acceptErr.message}`)
  console.log('   OK')

  console.log('5) A sendet Nachricht an B ...')
  const { error: msgErr } = await clientA
    .from('messages')
    .insert({ sender_id: idA, recipient_id: idB, content: 'Hallo B, das ist ein Test!' })
  if (msgErr) throw new Error(`send message: ${msgErr.message}`)
  console.log('   OK')

  console.log('6) B liest die Konversation mit A ...')
  const { data: messages, error: readErr } = await clientB
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${idA},recipient_id.eq.${idB}),and(sender_id.eq.${idB},recipient_id.eq.${idA})`)
  if (readErr) throw new Error(`read messages: ${readErr.message}`)
  if (!messages.length) throw new Error('B sieht keine Nachrichten')
  console.log('   OK:', messages.map((m) => m.content))

  console.log('\n✅ Kompletter Flow (Signup -> Suche -> Anfrage -> Annehmen -> Chat) funktioniert.')
}

main().catch((err) => {
  console.error('\n❌ FEHLER:', err.message)
  process.exit(1)
})
