export function Logo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="gsd-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7c5cff" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <rect x="40" y="40" width="432" height="432" rx="96" fill="url(#gsd-logo)" />
      <rect x="216" y="140" width="80" height="150" rx="40" fill="#0f0f12" />
      <path
        d="M176 262 a80 80 0 0 0 160 0"
        fill="none"
        stroke="#0f0f12"
        strokeWidth="22"
        strokeLinecap="round"
      />
      <line x1="256" y1="342" x2="256" y2="384" stroke="#0f0f12" strokeWidth="22" strokeLinecap="round" />
    </svg>
  )
}
