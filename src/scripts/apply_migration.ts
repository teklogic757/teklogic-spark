
import dotenv from 'dotenv'
import { Client } from 'pg'
import fs from 'fs'
import { resolve } from 'path'

// Load env vars
dotenv.config({ path: resolve(__dirname, '../../.env.local') })

const connectionString = process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL

if (!connectionString) {
    console.error('Missing POSTGRES_URL or SUPABASE_DB_URL in .env.local')
    process.exit(1)
}

async function runMigration() {
    const client = new Client({ connectionString })

    try {
        await client.connect()
        console.log('Connected to DB')

        const sqlPath = resolve(__dirname, '../../add_votes_column.sql')
        const sql = fs.readFileSync(sqlPath, 'utf8')

        console.log('Running migration from:', sqlPath)
        await client.query(sql)

        console.log('Migration successful!')
    } catch (err) {
        console.error('Migration failed:', err)
    } finally {
        await client.end()
    }
}

runMigration()
