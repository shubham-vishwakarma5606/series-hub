export default function Logo ({ compact = false, muted = false }) {
  if (compact) {
    return (
      <span className={`lg lg-c${muted ? ' muted' : ''}`} aria-label="Series Hub">
        <b>S</b><b className="h">H</b>
      </span>
    )
  }
  return (
    <span className={`lg${muted ? ' muted' : ''}`} aria-label="Series Hub">
      <b>SERIES</b><b className="h">HUB</b>
    </span>
  )
}
