// Watch Party transport — BroadcastChannel keeps tabs of this browser in sync
// (open the invite link in a second tab to try it). The send/subscribe surface
// is transport-agnostic: slot a WebSocket/WebRTC signaling adapter in here to
// make it work across devices — no app code changes needed.

let bc = null
let myId = null
let peers = new Set()
let pingTimer = null

export const PARTY_SUPPORTED = typeof BroadcastChannel !== 'undefined'

export function makeRoomCode () {
  const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 4 }, () => A[Math.floor(Math.random() * A.length)]).join('')
}

export function joinParty (room, { onEvent, onPresence } = {}) {
  leaveParty()
  if (!PARTY_SUPPORTED) return null
  const code = room.toUpperCase().trim()
  myId = Math.random().toString(36).slice(2, 8)
  bc = new BroadcastChannel('sh-party-' + code)
  peers = new Set()
  bc.onmessage = (e) => {
    const m = e.data || {}
    if (m.from === myId) return
    if (m.kind === 'ping') {
      peers.add(m.from)
      bc.postMessage({ kind: 'pong', from: myId })
      onPresence?.(peers.size + 1)
      return
    }
    if (m.kind === 'pong') {
      peers.add(m.from)
      onPresence?.(peers.size + 1)
      return
    }
    if (m.kind === 'bye') {
      peers.delete(m.from)
      onPresence?.(Math.max(1, peers.size + 1))
      return
    }
    onEvent?.(m)
  }
  bc.postMessage({ kind: 'ping', from: myId })
  pingTimer = setInterval(() => bc?.postMessage({ kind: 'ping', from: myId }), 9000)
  return code
}

export function sendParty (payload) {
  if (bc && myId) bc.postMessage({ ...payload, from: myId, at: Date.now() })
}

export function leaveParty () {
  try { bc?.postMessage({ kind: 'bye', from: myId }) } catch { /* closed */ }
  clearInterval(pingTimer)
  bc?.close()
  bc = null
  peers = new Set()
}
