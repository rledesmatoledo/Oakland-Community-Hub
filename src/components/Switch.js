// On/off switch (brand when on). Pass labelledBy to point at the visible label.
export default function Switch({ checked, onChange, labelledBy, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className="min-h-11 flex items-center flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span className={`w-11 h-6 rounded-full p-0.5 flex transition-colors ${
        checked ? 'bg-brand justify-end' : 'bg-field-border justify-start'
      }`}>
        <span className="w-5 h-5 rounded-full bg-surface" />
      </span>
    </button>
  )
}
