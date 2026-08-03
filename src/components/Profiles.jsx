import { useState } from 'react'
import Logo from './Logo.jsx'
import { chime } from '../utils/sound.js'

export const PROFILES = [
  { id: 'aditi', name: 'Aditi', c1: '#0b2a5b', c2: '#2e93ff', face: 'smile' },
  { id: 'rohan', name: 'Rohan', c1: '#4d0510', c2: '#e50914', face: 'grin' },
  { id: 'meera', name: 'Meera', c1: '#120a33', c2: '#7a5cff', face: 'calm' },
  { id: 'kabir', name: 'Kabir', c1: '#03181f', c2: '#18c6d8', face: 'cool' },
  { id: 'kids', name: 'Kids', c1: '#04263f', c2: '#0f8aa0', face: 'kids', badge: true }
]

function Face ({ v }) {
  switch (v) {
    case 'grin':
      return (<>
        <circle cx="33" cy="42" r="5" fill="#05060a" /><circle cx="67" cy="42" r="5" fill="#05060a" />
        <path d="M28 62 Q50 84 72 62 Q50 72 28 62" fill="#05060a" />
      </>)
    case 'calm':
      return (<>
        <rect x="26" y="39" width="15" height="6" rx="3" fill="#05060a" /><rect x="59" y="39" width="15" height="6" rx="3" fill="#05060a" />
        <path d="M35 66 Q50 74 65 66" stroke="#05060a" strokeWidth="5" fill="none" strokeLinecap="round" />
      </>)
    case 'cool':
      return (<>
        <rect x="22" y="36" width="24" height="12" rx="6" fill="#05060a" /><rect x="54" y="36" width="24" height="12" rx="6" fill="#05060a" />
        <rect x="46" y="41" width="8" height="4" fill="#05060a" />
        <path d="M34 68 Q50 76 66 68" stroke="#05060a" strokeWidth="5" fill="none" strokeLinecap="round" />
      </>)
    case 'kids':
      return (<>
        <circle cx="30" cy="24" r="12" fill="rgba(255,255,255,.85)" /><circle cx="70" cy="24" r="12" fill="rgba(255,255,255,.85)" />
        <circle cx="33" cy="42" r="5" fill="#05060a" /><circle cx="67" cy="42" r="5" fill="#05060a" />
        <path d="M30 62 Q50 80 70 62" stroke="#05060a" strokeWidth="6" fill="none" strokeLinecap="round" />
      </>)
    default: // smile
      return (<>
        <circle cx="33" cy="42" r="5" fill="#05060a" /><circle cx="67" cy="42" r="5" fill="#05060a" />
        <path d="M32 60 Q50 78 68 60" stroke="#05060a" strokeWidth="6" fill="none" strokeLinecap="round" />
      </>)
  }
}

export default function Profiles ({ onPick }) {
  const [manage, setManage] = useState(false)
  const [leaving, setLeaving] = useState(null)

  const pick = (p) => {
    if (leaving) return
    try { chime() } catch {}
    setLeaving(p.id)
    setTimeout(() => onPick(p), 620)
  }

  return (
    <div className={`profiles gate${leaving ? ' leave' : ''}`}>
      <header className="gate-bar"><Logo /></header>
      <main className="gate-main">
        <h1 className="gate-title">Who’s watching?</h1>
        <ul className="p-grid">
          {PROFILES.map((p, i) => (
            <li key={p.id} style={{ '--d': `${i * 80}ms` }}>
              <button
                className={`p-tile${leaving === p.id ? ' sel' : ''}${p.badge ? ' kids' : ''}`}
                onClick={() => pick(p)}
                aria-label={`Choose profile ${p.name}`}
              >
                <span className="p-avatar" style={{ '--c1': p.c1, '--c2': p.c2 }}>
                  <svg viewBox="0 0 100 100" aria-hidden="true"><Face v={p.face} /></svg>
                  {p.badge && <span className="p-badge">KIDS</span>}
                  {manage && (
                    <span className="p-edit" aria-hidden="true">
                      <svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 17.2V21h3.8L17.9 9.9l-3.8-3.8L3 17.2zM20.7 7a1 1 0 0 0 0-1.4l-2.3-2.3a1 1 0 0 0-1.4 0l-1.8 1.8 3.7 3.7 1.8-1.8z"/></svg>
                    </span>
                  )}
                </span>
                <span className="p-name">{p.name}</span>
              </button>
            </li>
          ))}
          <li style={{ '--d': `${PROFILES.length * 80}ms` }}>
            <button className="p-tile p-add" aria-label="Add profile" onClick={() => pick(PROFILES[0])}>
              <span className="p-avatar add">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5z"/></svg>
              </span>
              <span className="p-name">Add Profile</span>
            </button>
          </li>
        </ul>
        <button className={`p-manage${manage ? ' on' : ''}`} onClick={() => setManage((m) => !m)}>
          {manage ? 'Done' : 'Manage Profiles'}
        </button>
      </main>
    </div>
  )
}
