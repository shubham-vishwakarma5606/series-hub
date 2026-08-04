import { useEffect, useRef, useState } from 'react'
import Logo from './Logo.jsx'
import { verifyPin } from '../utils/pin.js'

// 4-digit PIN pad — used to lock/unlock the Kids profile and to set/change
// the household PIN. mode: 'verify' (enter current) | 'setup' (verify current
// if one exists, then choose new twice). PINs are verified against the hashed
// stored record (utils/pin.js), never compared in plaintext.
export default function KidsPin ({ mode, expected, title, subtitle, onClose, onDone }) {
  const wantsCurrentFirst = mode === 'setup' && Boolean(expected)
  const [stage, setStage] = useState(mode === 'verify' ? 'enter' : wantsCurrentFirst ? 'current' : 'new')
  const [pin, setPin] = useState('')
  const [first, setFirst] = useState('')
  const [err, setErr] = useState('')
  const busy = useRef(false)

  const TITLES = {
    enter: title || 'Enter your PIN',
    current: 'Enter current PIN',
    new: 'Choose a new PIN',
    confirm: 'Re-enter the new PIN'
  }

  const flash = (msg) => {
    setErr(msg)
    setPin('')
    setTimeout(() => setErr(''), 2200)
  }

  const submit = async (value) => {
    if (busy.current) return
    busy.current = true
    try {
      if (stage === 'enter' || stage === 'current') {
        const r = await verifyPin(value, expected || '')
        if (r.ok) {
          if (stage === 'enter') onDone?.({ pin: value, upgraded: r.upgraded || null })
          else { setStage('new'); setPin('') }
        } else flash('Wrong PIN. Try again.')
      } else if (stage === 'new') {
        setFirst(value)
        setPin('')
        setStage('confirm')
      } else if (stage === 'confirm') {
        if (value === first) onDone?.({ pin: value })
        else { flash('PINs didn’t match. Start over.'); setFirst(''); setStage('new') }
      }
    } finally {
      busy.current = false
    }
  }

  const press = (d) => {
    if (d === 'back') { setPin((p) => p.slice(0, -1)); return }
    if (pin.length >= 4) return
    const next = pin + d
    setPin(next)
    if (next.length === 4) setTimeout(() => submit(next), 120)
  }

  useEffect(() => {
    const key = (e) => {
      if (e.key === 'Escape') onClose?.()
      else if (/^\d$/.test(e.key)) press(e.key)
      else if (e.key === 'Backspace') press('back')
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  })

  return (
    <div className="pin-wrap" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.() }}>
      <div className={`pin-card${err ? ' shake' : ''}`} role="dialog" aria-modal="true" aria-label="Kids profile PIN">
        <span className="pin-brand"><Logo compact /></span>
        <span className="pin-kid" aria-hidden="true">KIDS LOCK</span>
        <h3>{TITLES[stage]}</h3>
        {subtitle && stage === 'enter' && <p className="pin-sub">{subtitle}</p>}
        <div className="pin-dots" aria-label={`${pin.length} of 4 digits entered`}>
          {[0, 1, 2, 3].map((i) => <span key={i} className={pin.length > i ? 'on' : ''} />)}
        </div>
        {err && <p className="pin-err" role="alert">{err}</p>}
        <div className="pin-pad">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'].map((d, i) => (
            d === ''
              ? <span key={i} />
              : d === 'back'
                ? <button key={i} onClick={() => press('back')} aria-label="Backspace">⌫</button>
                : <button key={i} onClick={() => press(d)}>{d}</button>
          ))}
        </div>
        <button className="pin-cancel" onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}
