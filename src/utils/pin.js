// PIN storage security: household PINs are stored salted+hashed (SHA-256 via
// WebCrypto) at `sh.pin`, never plaintext. Legacy plaintext records upgrade
// transparently on next successful verify. On non-secure contexts (plain HTTP)
// WebCrypto is unavailable — we degrade to a marked 'plain:' record.

const te = new TextEncoder()
const SALT = 'sh·pin·v1'
const hasSubtle = typeof crypto !== 'undefined' && !!crypto.subtle

async function sha256hex (str) {
  const buf = await crypto.subtle.digest('SHA-256', te.encode(str))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function hashPin (pin) {
  if (!hasSubtle) return 'plain:' + pin
  return 'sha256:' + (await sha256hex(SALT + pin))
}

export async function verifyPin (pin, record) {
  if (!record) return { ok: false }
  if (record.startsWith('sha256:')) {
    return { ok: (await hashPin(pin)) === record }
  }
  if (record.startsWith('plain:')) {
    return { ok: record.slice(6) === pin }
  }
  // legacy unmarked plaintext → verify, then hand back a hashed upgrade
  const ok = record === pin
  return { ok, upgraded: ok ? await hashPin(pin) : null }
}
