// Führt eine .sql-Datei direkt gegen die Supabase-Postgres-Instanz aus (für
// Schemaänderungen, die über den REST-Client nicht möglich sind, z.B. neue
// Spalten/Funktionen). Aufruf: DB_PASSWORD=... node scripts/run_migration.mjs pfad/zur/datei.sql
import pg from 'pg'
import { readFileSync } from 'node:fs'

const password = process.env.DB_PASSWORD
const sqlFile = process.argv[2]
const sql = readFileSync(sqlFile, 'utf8')
const connectionString = `postgresql://postgres:${encodeURIComponent(password)}@db.hgzqicwctzetojxmlcrr.supabase.co:5432/postgres`

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })

try {
  await client.connect()
  await client.query(sql)
  console.log('Migration applied successfully.')
} finally {
  await client.end()
}
