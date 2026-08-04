// Thumb-reachable bottom navigation for phones/tablets (≤760px) — the core of
// the "mobile app" feel. Hidden on larger screens via CSS.
const TABS = [
  { key: 'home', label: 'Home', icon: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z' },
  { key: 'fresh', label: 'New & Hot', icon: 'M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z' },
  { key: 'search', label: 'Search', icon: 'M15.5 14h-.8l-.3-.3a6.5 6.5 0 1 0-.7.7l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z' },
  { key: 'live', label: 'Status', icon: 'M12 11a2 2 0 0 0-2 2c0 .74.4 1.38 1 1.73V18h2v-3.27c.6-.35 1-.99 1-1.73a2 2 0 0 0-2-2zm0-9a10 10 0 0 1 9.95 9h-2.02A8 8 0 0 0 4.07 11H2.05A10 10 0 0 1 12 2zm0 4a6 6 0 0 1 5.97 5.5h-2A4 4 0 0 0 8.03 10.5h-2A6 6 0 0 1 12 6z' },
  { key: 'mylist', label: 'My List', icon: 'M4 5h16v2H4zm0 6h16v2H4zm0 6h10v2H4z' }
]

const GETAPP_ICON = 'M17.6 9.48l1.84-3.18a.38.38 0 0 0-.66-.38l-1.86 3.22a11.66 11.66 0 0 0-9.84 0L5.22 5.92a.38.38 0 0 0-.66.38L6.4 9.48A10.78 10.78 0 0 0 1 18h22a10.78 10.78 0 0 0-5.4-8.52zM7 15.25a1 1 0 1 1 1-1 1 1 0 0 1-1 1zm10 0a1 1 0 1 1 1-1 1 1 0 0 1-1 1z'

export default function MobileNav ({ tab, onTab, searchOpen, onSearch, onGetApp }) {
  return (
    <nav className="mnav" aria-label="Mobile navigation">
      {TABS.map(({ key, label, icon }) => {
        const active = key === 'search' ? searchOpen : (!searchOpen && tab === key)
        return (
          <button
            key={key}
            className={active ? 'on' : ''}
            aria-current={active ? 'page' : undefined}
            onClick={() => (key === 'search' ? onSearch() : onTab(key))}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d={icon} /></svg>
            <span>{label}</span>
          </button>
        )
      })}
      <button onClick={() => onGetApp?.()} aria-label="Get the Series Hub Android app">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d={GETAPP_ICON} /></svg>
        <span>Get App</span>
      </button>
    </nav>
  )
}
