import { setConsent } from '../utils/cookies.js'

// Cookie & storage consent bar — shown once, until answered.
// Series Hub uses localStorage (not third-party ad cookies): auth session,
// profile, list & progress are essential; likes/taste-profile are optional.

export default function CookieConsent ({ onDone }) {
  const choose = (analytics) => onDone(setConsent(analytics))
  return (
    <div className="cookie" role="region" aria-label="Cookie and storage choices">
      <div className="ck-txt">
        <b>Your privacy, your call.</b>
        <p>
          Series Hub stores data on this device to keep you signed in and remember your list.
          Optional storage powers likes &amp; your taste profile. Connection checks to our own
          stream hosts are essential for playback. No ad tracking, ever.
        </p>
      </div>
      <div className="ck-btns">
        <button className="ck-accept" onClick={() => choose(true)}>Accept all</button>
        <button className="ck-essential" onClick={() => choose(false)}>Essential only</button>
      </div>
    </div>
  )
}
