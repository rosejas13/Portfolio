declare module '*.css' {
  const content: string
  export default content
}

interface Window {
  turnstile?: {
    render: (selector: string, options: Record<string, unknown>) => string
    remove: (selector: string) => void
    reset: (selector: string) => void
  }
  onloadTurnstile?: () => void
}
