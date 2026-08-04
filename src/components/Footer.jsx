import { TMDB_ENABLED } from '../utils/tmdb.js'
import { ANDROID_ICON } from './GetApp.jsx'

const INSTALL_ICON = 'M12 3l4.2 4.2-1.4 1.4-1.8-1.8V14h-2V6.8L9.2 8.6 7.8 7.2zM5 19h14v2H5z'

export default function Footer ({ onGetApp }) {
  const cols = [
    ['FAQ', 'Investor Relations', 'Privacy', 'Speed Test'],
    ['Help Center', 'Jobs', 'Cookie Preferences', 'Legal Notices'],
    ['Account', 'Ways to Watch', 'Corporate Information', 'Only on Series Hub'],
    ['Media Center', 'Terms of Use', 'Contact Us', 'Redeem Gift Cards']
  ]
  return (
    <footer className="footer">
      <div className="ft-social">
        {[
          'M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z',
          'M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1s-3.6 0-4.9-.1c-3.3-.1-4.8-1.7-4.9-4.9 0-1.3-.1-1.6-.1-4.8s0-3.6.1-4.8C2.3 4 3.9 2.4 7.1 2.3 8.4 2.2 8.8 2.2 12 2.2zm0 3.6a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zm0 10.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-10.4a1.4 1.4 0 1 0 0-2.9 1.4 1.4 0 0 0 0 2.9z',
          'M23 4.9c-.8.4-1.7.6-2.6.8a4.5 4.5 0 0 0 2-2.5c-.9.5-1.9.9-2.9 1.1a4.5 4.5 0 0 0-7.7 4.1A12.8 12.8 0 0 1 2.5 3.6a4.5 4.5 0 0 0 1.4 6 4.4 4.4 0 0 1-2-.6v.1c0 2.2 1.6 4 3.6 4.4a4.5 4.5 0 0 1-2 .1c.6 1.8 2.2 3.1 4.1 3.2A9 9 0 0 1 1 18.6a12.7 12.7 0 0 0 6.9 2c8.3 0 12.8-6.9 12.8-12.8v-.6c.9-.6 1.6-1.4 2.3-2.3z',
          'M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8zM9.6 15.6V8.4L15.8 12l-6.2 3.6z'
        ].map((d, i) => (
          <button key={i} aria-label={['Facebook', 'Instagram', 'X', 'YouTube'][i]}>
            <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d={d} /></svg>
          </button>
        ))}
      </div>
      <p className="ft-line">Audio and Subtitles</p>

      <div className="ft-apps" aria-label="Get the Series Hub app">
        <button className="ft-badge" onClick={() => onGetApp?.()}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d={ANDROID_ICON} /></svg>
          <span className="ft-badge-txt"><i>Get it on</i><b>Android · APK</b></span>
        </button>
        <button className="ft-badge" onClick={() => onGetApp?.()}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d={INSTALL_ICON} /></svg>
          <span className="ft-badge-txt"><i>Instant install</i><b>Web App · PWA</b></span>
        </button>
      </div>

      <div className="ft-cols">
        {cols.map((c, i) => (
          <ul key={i}>{c.map((l) => <li key={l}><a href="#" onClick={(e) => e.preventDefault()}>{l}</a></li>)}</ul>
        ))}
      </div>
      <button className="ft-code">Service Code</button>
      <p className="ft-copy">© 1997–2026 Series Hub, Inc. &nbsp;·&nbsp; A streaming experience in blue, black &amp; red.</p>
      {TMDB_ENABLED && (
        <p className="tmdb-attr">This product uses the TMDB API but is not endorsed or certified by TMDB. Film/TV metadata &amp; artwork © TMDB poster contributors; trailers © their respective owners (YouTube embeds).</p>
      )}
    </footer>
  )
}
