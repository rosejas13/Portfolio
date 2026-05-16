export function RoseIcon({ size = 14, className }: { size?: number; className?: string }) {
  return (
<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="1.3"
  strokeLinecap="round"
  strokeLinejoin="round"
  aria-hidden="true"
  className={className}
>
  <path d="M12.15 3.2c-2.8 1.65-4.7 4.55-3.9 7.35.65 2.25 2.35 3.6 3.7 2.75 1.45.95 3.3-.55 3.9-2.9.75-3-1.2-5.8-3.7-7.2z" />

  <path d="M10.25 6.55c.9-.95 2.45-1.2 3.35-.3" />
  <path d="M13.65 6.3c.35 1.65-.45 3.05-2.25 3.85" />

  <path d="M7.85 7.05c-1.95 1.7-2.85 4.35-1.25 6.45 1.35 1.75 3.6 1.75 5.15.05" />
  <path d="M16.25 6.85c1.85 1.8 2.55 4.45 1.05 6.5-1.3 1.75-3.55 1.85-5.05.15" />

  <path d="M12 13.45v7.3" />

  <path d="M11.45 18.15c-1.55-.2-2.95.5-3.8 1.75m.35.2c1.1.1 2.1-.25 2.95-1.05" />
  <path d="M12.55 18.15c1.55-.2 2.95.5 3.8 1.75m-.35.2c-1.1.1-2.1-.25-2.95-1.05" />
</svg>
  )
}
