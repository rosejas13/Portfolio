export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  ok: boolean
  errors: ValidationError[]
}

type Validator = (value: unknown) => string | null

function required(msg?: string): Validator {
  return (v) => (v == null || v === '' ? msg || 'Required' : null)
}

function maxLength(max: number, msg?: string): Validator {
  return (v) =>
    typeof v === 'string' && v.length > max
      ? msg || `Must be at most ${max} characters`
      : null
}

function pattern(regex: RegExp, msg?: string): Validator {
  return (v) =>
    typeof v === 'string' && !regex.test(v) ? msg || 'Invalid format' : null
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/
const urlPattern = /^https?:\/\/.+/

export const validators = {
  required,
  maxLength,
  pattern,
  email: () => pattern(emailPattern, 'Invalid email address'),
  slug: () => pattern(slugPattern, 'Invalid slug format'),
  url: () => pattern(urlPattern, 'Must be a valid URL'),
}

export function validate(
  data: Record<string, unknown>,
  rules: Record<string, Validator[]>
): ValidationResult {
  const errors: ValidationError[] = []
  for (const [field, validators] of Object.entries(rules)) {
    for (const v of validators) {
      const err = v(data[field])
      if (err) {
        errors.push({ field, message: err })
        break
      }
    }
  }
  return { ok: errors.length === 0, errors }
}
