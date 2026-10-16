import type { Theme, ThemeTokenName } from '../course-kit'

// The host paints the chrome of the game (bars, panels, text, code panel); the circuit stage is the game's own
// screen and keeps its identity: pulse, family and status colors, and a dark ground the glow needs.
const CSS_VARIABLE: Partial<Record<ThemeTokenName, string>> = {
  page: '--bg',
  surface: '--panel',
  elevated: '--panel-2',
  border: '--line',
  textPrimary: '--text',
  textSecondary: '--muted',
  textMuted: '--faint',
  accent: '--accent',
  fontSans: '--font-sans',
  fontMono: '--font-mono',
}

export const HONORED_TOKENS = Object.keys(CSS_VARIABLE) as ThemeTokenName[]

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const TEXT_TOKENS: ThemeTokenName[] = ['textPrimary', 'textSecondary', 'textMuted']
const MIN_CONTRAST = 4.5

// The CSS variables a theme sets on the game. Text colors that would be hard to read on the host's own surface
// are ignored (the game keeps its readable ones) rather than applied.
export function themeVariables(theme: Theme | undefined): Record<string, string> {
  const tokens = { ...(theme?.tokens ?? {}) } as Partial<Record<ThemeTokenName, string>>
  const ground = tokens.surface ?? tokens.page
  if (ground && tokens.textPrimary && contrastRatio(tokens.textPrimary, ground) < MIN_CONTRAST) for (const name of TEXT_TOKENS) delete tokens[name]
  return Object.fromEntries(Object.entries(tokens).flatMap(([name, value]) => (CSS_VARIABLE[name as ThemeTokenName] ? [[CSS_VARIABLE[name as ThemeTokenName]!, value]] : [])))
}
