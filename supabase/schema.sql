-- FeelingMatch: Schema für Profile, Freundschaften und Chat-Nachrichten.
-- Einmal komplett in den Supabase SQL Editor einfügen und ausführen
-- (Project -> SQL Editor -> New query).

-- ─── profiles ──────────────────────────────────────────────────────────────
-- Ein Profil pro Auth-Nutzer, wird automatisch beim Signup erzeugt (Trigger
-- weiter unten). display_name ist das, womit man in der App gesucht/begrüßt
-- wird.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  age integer check (age > 0 and age < 120),
  gender text check (gender in ('weiblich', 'maennlich', 'divers', 'keine_angabe')),
  -- Statuszeile + Ampel-Selbsteinschätzung, für Freunde sichtbar (siehe
  -- FriendsPage). status_color ist eine bewusste, manuelle Angabe ("wie sehr
  -- brauche ich gerade Unterstützung"), nicht automatisch aus der Stimmung
  -- abgeleitet. pain_level ist "wie stark?" (0-10, UI nutzt 1-6) – dieselbe
  -- Frage wie im täglichen Check-in (siehe mood_logs.intensity), hier aber
  -- nur der aktuelle Momentanwert, per Profil-Speichern oder Check-in
  -- überschreibbar.
  status_text text,
  status_color text check (status_color in ('green', 'yellow', 'red')),
  pain_level integer check (pain_level >= 0 and pain_level <= 10),
  status_updated_at timestamptz,
  -- Pfad zu einem der vorgefertigten Avatar-Bilder (public/avatars), z.B.
  -- "/avatars/emotion-3.png". Kein Bild-Upload, nur Auswahl aus fester Liste.
  avatar_url text,
  -- Gamification: Avatare werden nach und nach freigeschaltet (siehe
  -- gamificationService.js). xp steigt, wenn an einem neuen Kalendertag der
  -- Status gespeichert wird (last_xp_awarded_on) UND wenn an einem neuen
  -- Kalendertag der tägliche Stimmungs-Check-in abgeschlossen wird
  -- (last_checkin_xp_awarded_on) – beides unabhängig voneinander, damit ein
  -- Tag mit beidem auch beide XP bringt, aber keine der beiden Quellen
  -- mehrfach am selben Tag zählt. unlocked_avatars ist die Liste bereits
  -- freigeschalteter Avatar-IDs (z.B. ["emotion-7","emotion-2"]), der erste
  -- zufällig per "Karte aufdecken", der Rest der Reihe nach über XP-Schwellen.
  xp integer not null default 0,
  unlocked_avatars jsonb not null default '[]'::jsonb,
  last_xp_awarded_on date,
  last_checkin_xp_awarded_on date,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles sind für eingeloggte Nutzer sichtbar"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "Nutzer können ihr eigenes Profil bearbeiten"
  on public.profiles for update
  using (auth.uid() = id);

-- Legt bei jeder neuen Registrierung automatisch eine Zeile in profiles an.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Gast-Sessions (supabase.auth.signInAnonymously(), siehe
  -- authService.continueAsGuest) haben weder E-Mail noch Metadaten – ohne
  -- diesen Fallback würde der Insert an "display_name not null" scheitern
  -- und die gesamte Anmeldung fehlschlagen.
  insert into public.profiles (id, display_name, age, gender)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      split_part(new.email, '@', 1),
      'Gast-' || substr(new.id::text, 1, 6)
    ),
    nullif(new.raw_user_meta_data ->> 'age', '')::integer,
    new.raw_user_meta_data ->> 'gender'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── friendships ───────────────────────────────────────────────────────────
-- Eine Zeile pro Freundschaftsanfrage. status='pending' bis die/der
-- Empfänger:in annimmt, danach 'accepted'.
create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  addressee_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  unique (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);

alter table public.friendships enable row level security;

create policy "Nutzer sehen eigene Freundschaften/Anfragen"
  on public.friendships for select
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

create policy "Nutzer senden Anfragen als requester"
  on public.friendships for insert
  with check (auth.uid() = requester_id);

create policy "Empfänger:in kann Anfrage annehmen"
  on public.friendships for update
  using (auth.uid() = addressee_id);

-- Beide Seiten dürfen die Zeile löschen: Empfänger:in lehnt eine Anfrage ab,
-- oder eine der beiden Personen beendet eine bestehende Freundschaft.
create policy "Beteiligte können Freundschaft/Anfrage löschen"
  on public.friendships for delete
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- ─── messages ──────────────────────────────────────────────────────────────
-- 1:1-Nachrichten zwischen zwei Profilen (keine Gruppen-Chats).
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles (id) on delete cascade,
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  content text not null check (char_length(trim(content)) > 0),
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "Nutzer sehen eigene Nachrichten"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "Nutzer senden Nachrichten als sender"
  on public.messages for insert
  with check (auth.uid() = sender_id);

-- Realtime-Updates für den Chat aktivieren (kein Polling nötig).
alter publication supabase_realtime add table public.messages;

-- ─── mood_logs ─────────────────────────────────────────────────────────────
-- Ein Eintrag pro geloggter Stimmung (täglicher Check-in, Home-Auswahl,
-- PANAS-Ergebnis, ...). Baut über die Zeit einen echten Stimmungsverlauf
-- pro Person auf, statt der bisherigen Beispieldaten im Profil.
create table if not exists public.mood_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  mood_name text not null,
  mood_emoji text not null,
  -- Valenz (1-5) zum Zeitpunkt des Loggens, v.a. für eigene Emotionen
  -- relevant, die nicht in data/emotions.js stehen (siehe
  -- customEmotionsService.js). Alte Zeilen bleiben null und die Auswertung
  -- fällt dann auf VALENCE_BY_NAME[mood_name] zurück.
  valence numeric,
  source text not null default 'manual' check (source in ('daily_checkin', 'home', 'panas', 'manual')),
  -- Wie stark diese eine Emotion gefühlt wurde (1-6), optional, nur aus dem
  -- täglichen Check-in – dieselbe Frage/Skala wie profiles.pain_level (siehe
  -- dort), aber hier an die konkrete geloggte Emotion gebunden statt nur als
  -- aktueller Momentanwert im Profil.
  intensity smallint check (intensity between 1 and 6),
  created_at timestamptz not null default now()
);

alter table public.mood_logs enable row level security;

create policy "Nutzer sehen eigene Mood-Logs"
  on public.mood_logs for select
  using (auth.uid() = user_id);

create policy "Nutzer loggen eigene Stimmung"
  on public.mood_logs for insert
  with check (auth.uid() = user_id);

-- ─── custom_emotions ───────────────────────────────────────────────────────
-- Frei angelegte, personenbezogene Emotionen ("Joker-Karte") – bewusst ohne
-- KI-Analyse: Name, Emoji und Ampel-Farbe wählt die Person selbst. Bleibt
-- gespeichert und steht bei künftigen Auswahlen wieder zur Verfügung.
create table if not exists public.custom_emotions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  emoji text not null,
  ampel_color text not null check (ampel_color in ('green', 'yellow', 'red')),
  created_at timestamptz not null default now()
);

alter table public.custom_emotions enable row level security;

create policy "Nutzer sehen eigene Custom-Emotionen"
  on public.custom_emotions for select
  using (auth.uid() = user_id);

create policy "Nutzer legen eigene Custom-Emotionen an"
  on public.custom_emotions for insert
  with check (auth.uid() = user_id);

-- ─── Zufalls-Charakter-Sorteo ──────────────────────────────────────────────
-- Motivations-Feature: ein globaler, nie zurückgesetzter Zähler über alle
-- abgeschlossenen täglichen Check-ins (aller Nutzer:innen zusammen). Jeder
-- 4. Check-in löst ein Sorteo unter ALLEN registrierten Profilen aus – die
-- gewinnende Person (kann auch mehrfach gewinnen) bekommt eines von 7
-- Zufallsbildern (public/random/random1.png .. random7.png) als
-- "pending_random_avatar" vorgemerkt und sieht beim nächsten Öffnen der App
-- ein Popup, um es als Profilbild zu übernehmen (siehe RandomAvatarModal.jsx).
-- Läuft als SECURITY DEFINER-Funktion, weil eine normale Nutzer-Session laut
-- RLS oben nur das eigene Profil verändern darf, das Sorteo aber ein
-- beliebiges anderes Profil markieren muss.
create table if not exists public.app_counters (
  id boolean primary key default true check (id),
  checkin_count integer not null default 0
);
insert into public.app_counters (id, checkin_count) values (true, 0) on conflict (id) do nothing;

alter table public.profiles add column if not exists pending_random_avatar text;

create or replace function public.register_checkin_and_maybe_award_random()
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  new_count integer;
  winner_id uuid;
  chosen_image text;
begin
  update public.app_counters set checkin_count = checkin_count + 1
    where id = true
    returning checkin_count into new_count;

  if new_count % 4 = 0 then
    select id into winner_id from public.profiles order by random() limit 1;
    chosen_image := 'random' || (floor(random() * 7) + 1)::int || '.png';
    update public.profiles set pending_random_avatar = chosen_image where id = winner_id;
  end if;
end;
$$;

-- Supabase gewährt EXECUTE auf neue Funktionen in "public" per Default an
-- anon UND authenticated – ohne das explizite revoke könnte jede unautorisierte
-- Anfrage (ganz ohne Login) beliebig oft das Sorteo auslösen.
revoke execute on function public.register_checkin_and_maybe_award_random() from public, anon;
grant execute on function public.register_checkin_and_maybe_award_random() to authenticated;
