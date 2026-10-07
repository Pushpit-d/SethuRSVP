import { neon } from '@neondatabase/serverless'

export default async function handler(req, res) {
  let dbStatus = 'not tested'
  let tables = []

  try {
    const sql = neon(process.env.DATABASE_URL)
    const result = await sql`
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `
    dbStatus = 'connected'
    const grouped = {}
    for (const row of result) {
      if (!grouped[row.table_name]) grouped[row.table_name] = []
      grouped[row.table_name].push({ column: row.column_name, type: row.data_type })
    }
    tables = grouped
  } catch (err) {
    dbStatus = `error: ${err.message}`
  }

  res.status(200).json({ dbStatus, tables })
}
