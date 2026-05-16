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
  <path d="M11.6 12.25c-2.25-.45-3.85-1.75-4.2-3.4-.25-1.25.25-2.65 1.35-3.65 1.25.15 2.45.85 3.05 2" />
  <path d="M12.45 12.2c2.25-.5 3.85-1.85 4.15-3.55.25-1.3-.3-2.65-1.45-3.6-1.2.2-2.4.95-2.95 2.15" />

  <path d="M12.1 3.65c-1.55 1.05-2.4 2.45-2.2 3.9.2 1.45 1.05 2.65 2.1 3.2 1.15-.55 2.1-1.85 2.25-3.35.15-1.45-.65-2.75-2.15-3.75z" />

  <path d="M12 10.75V7.6h1.7" />
  <path d="M12 7.6l-1.45-1.25" />

  <path d="M12 12.25v8.3" />

  <path d="M12 16.9h-1.45l-1.6 1.6H7.7" />
  <path d="M12 18.35h1.55l1.6 1.6h1.15" />

  <g fill="currentColor" stroke="none">
    <circle cx="8.75" cy="5.2" r=".52" />
    <circle cx="15.15" cy="5.05" r=".52" />
    <circle cx="13.7" cy="7.6" r=".42" />
    <circle cx="10.55" cy="6.35" r=".42" />
    <circle cx="7.7" cy="18.5" r=".5" />
    <circle cx="16.3" cy="19.95" r=".5" />
    <circle cx="12" cy="20.55" r=".45" />
  </g>
</svg>
  )
}
