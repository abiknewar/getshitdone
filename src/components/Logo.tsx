export function Logo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} aria-hidden="true" shapeRendering="crispEdges">
      <rect x="40" y="40" width="432" height="432" rx="96" fill="#0E0E0E" />
      <g fill="#FFFFFF">
        <rect x="216" y="120" width="80" height="150" rx="8" />
        <rect x="176" y="240" width="24" height="40" />
        <rect x="312" y="240" width="24" height="40" />
        <rect x="176" y="270" width="160" height="24" />
        <rect x="232" y="294" width="48" height="70" />
        <rect x="196" y="364" width="120" height="24" />
      </g>
    </svg>
  )
}
