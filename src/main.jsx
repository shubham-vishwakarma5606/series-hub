import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/main.css'

class ErrorBoundary extends React.Component {
  constructor (props) {
    super(props)
    this.state = { error: null, stack: null }
  }
  static getDerivedStateFromError (error) {
    return { error }
  }
  componentDidCatch (error, info) {
    // eslint-disable-next-line no-console
    console.error('[Series Hub] Uncaught error:', error, info)
    this.setState({ stack: info?.componentStack || String(error?.stack || error) })
  }
  render () {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '1rem',
          background: '#05060a', color: '#fff', padding: '2rem', fontFamily: 'Inter, sans-serif'
        }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Something went wrong</h1>
          <p style={{ color: '#b3b3b3', maxWidth: 560, textAlign: 'center' }}>
            Series Hub failed to load. Please hard-refresh the page. If it continues, clear site data
            (localStorage) for this origin.
          </p>
          <pre style={{
            maxWidth: '90vw', overflowX: 'auto', background: 'rgba(255,255,255,0.06)',
            padding: '1rem', borderRadius: 8, fontSize: '.78rem', color: '#ffd7d7'
          }}>
            {String(this.state.error?.message || this.state.error)}{'\n'}{String(this.state.stack || '').slice(0, 2000)}
          </pre>
          <div style={{ display: 'flex', gap: '.8rem' }}>
            <button onClick={() => window.location.reload()} style={{
              background: '#fff', color: '#05060a', padding: '.6em 1.2em', borderRadius: 6, fontWeight: 700
            }}>Reload</button>
            <button onClick={() => { try { localStorage.clear(); sessionStorage.clear() } catch {}; window.location.reload() }} style={{
              background: 'rgba(255,255,255,0.12)', color: '#fff', padding: '.6em 1.2em', borderRadius: 6, fontWeight: 600
            }}>Clear storage & reload</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

const rootEl = document.getElementById('root')
if (!rootEl) {
  // eslint-disable-next-line no-console
  console.error('[Series Hub] #root missing in index.html')
} else {
  createRoot(rootEl).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  )
}

// Global error logging — helps diagnose blank screen in preview/remote contexts
if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    // eslint-disable-next-line no-console
    console.error('[Series Hub] window.onerror', e.message, e.filename, e.lineno, e.error)
  })
  window.addEventListener('unhandledrejection', (e) => {
    // eslint-disable-next-line no-console
    console.error('[Series Hub] unhandledrejection', e.reason)
  })
}

// PWA: artwork/font precaching via service worker (production only)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  // Add a small delay so we don't compete with first paint
  setTimeout(() => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {})
  }, 3500)
}

