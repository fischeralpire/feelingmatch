export default function Toggle({ on, onToggle, label }) {
  return (
    <button
      type="button"
      className={`fm-toggle ${on ? 'is-on' : ''}`}
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
    />
  )
}
