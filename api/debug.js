import { neon } from '@neondatabase/serverless'

export default async function handler(req, res) {
  const envKeys = Object.keys(process.env).filter(k =>
    k.includes('DATABASE') || k.includes('NEON') || k.includes('POSTGRES') ||
    k.includes('RESEND') || k.includes('ADMIN') || k.includes('EMAIL') || k.includes('HOST')
  )

  let dbStatus = 'not tested'
  let tableExists = false

  try {
    const sql = neon(process.env.DATABASE_URL)
    const result = await sql`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'rsvps')`
    tableExists = result[0].exists
    dbStatus = 'connected'
  } catch (err) {
    dbStatus = `error: ${err.message}`
  }

  res.status(200).json({
    ok: true,
    envKeysFound: envKeys,
    nodeVersion: process.version,
    dbStatus,
    tableExists,
  })
}
