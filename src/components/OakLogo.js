// Oak tree mark: three overlapping circles for the canopy, a trunk, and a base line.
export default function OakLogo({ size = 28, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={`text-brand ${className}`}
    >
      <g fill="currentColor">
        <circle cx="10.5" cy="13" r="6" />
        <circle cx="21.5" cy="13" r="6" />
        <circle cx="16" cy="8.5" r="6.5" />
        <rect x="14.5" y="15" width="3" height="11" rx="1" />
      </g>
      <path d="M7 27h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
