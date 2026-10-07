export default function handler(req, res) {
  const envKeys = Object.keys(process.env).filter(k =>
    k.includes('DATABASE') || k.includes('NEON') || k.includes('POSTGRES') ||
    k.includes('RESEND') || k.includes('ADMIN') || k.includes('EMAIL') || k.includes('HOST')
  )

  res.status(200).json({
    ok: true,
    envKeysFound: envKeys,
    nodeVersion: process.version,
  })
}
