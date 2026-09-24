import { N } from '../i18n'

export const NEON = {
  bg: 0x060a13,
  grid: 0x141d33,
  wire: 0x2c3a5c,
  panel: 0x0c1324,
  cyan: 0x2de2e6,
  violet: 0xb57cff,
  amber: 0xffb86b,
  red: 0xff4d6d,
  green: 0x7cff9b,
  white: 0xf5f1d8,
  text: 0xe3ebff,
  muted: 0x6b7a99,
}

export const FONT_UI = 'Inter, system-ui, sans-serif'
export const FONT_MONO = '"JetBrains Mono", ui-monospace, Menlo, monospace'

// Color por etiqueta del pulso; lo desconocido brilla en blanco cálido.
const TAG_COLORS: Record<string, number> = {
  espresso: 0xffb86b,
  latte: 0xf3e3c3,
  cash: 0x7cff9b,
  card: 0x4cc9ff,
  voucher: 0xffc15e,
  app: 0xff5fd2,
  centro: 0x4cc9ff,
  playa: 0xffc15e,
  montana: 0xb57cff,
  puerto: 0x7cff9b,
  'args-cruzados': 0xffb86b,
  hielo: 0x9fe7ff,
}

export const pulseColor = (tags: string[]) => TAG_COLORS[tags.find((t) => t in TAG_COLORS) ?? ''] ?? NEON.white

// i18n
export const DROP_TEXT = {
  'no-wire': 'sin cable de salida',
  unhandled: 'nadie lo maneja (else)',
  guard: 'rechazado',
} as const

export const FAMILY_COLORS = {
  creational: NEON.amber,
  structural: NEON.cyan,
  behavioral: NEON.violet,
  architecture: NEON.green,
  resilience: 0xff5fd2,
  principle: NEON.white,
} as const

export const INVALID_TEXT = N('¡esto no es lo que pedí!')
