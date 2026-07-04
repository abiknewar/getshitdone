export function Logo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} aria-hidden="true">
      <defs>
        <pattern id="gsd-dots" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="7" cy="7" r="4.5" fill="#ffffff" opacity="0.35" />
        </pattern>
      </defs>
      <rect x="40" y="40" width="432" height="432" rx="96" fill="#3D5AFE" />
      <rect x="40" y="40" width="432" height="432" rx="96" fill="url(#gsd-dots)" />
      <rect x="216" y="140" width="80" height="150" rx="40" fill="#ffffff" />
      <path
        d="M176 262 a80 80 0 0 0 160 0"
        fill="none"
        stroke="#ffffff"
        strokeWidth="22"
        strokeLinecap="round"
      />
      <line x1="256" y1="342" x2="256" y2="384" stroke="#ffffff" strokeWidth="22" strokeLinecap="round" />
    </svg>
  )
}
