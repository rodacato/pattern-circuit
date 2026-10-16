import { describe, expect, it } from 'vitest'
import { Theme } from '../course-kit'
import { contrastRatio, HONORED_TOKENS, themeVariables } from './theme'

const washi = Theme.parse({ mode: 'light', tokens: { page: '#F5F1E8', surface: '#EDE7D9', elevated: '#E3DCC9', border: '#C9BFA8', textPrimary: '#1F1B16', textSecondary: '#5C5448', textMuted: '#8A8071', accent: '#B73A2F', success: '#5C7A4E' } })

describe('theme variables', () => {
  it('maps the tokens the game honors and leaves its status colors alone', () => {
    expect(themeVariables(washi)).toEqual({ '--bg': '#F5F1E8', '--panel': '#EDE7D9', '--panel-2': '#E3DCC9', '--line': '#C9BFA8', '--text': '#1F1B16', '--muted': '#5C5448', '--faint': '#8A8071', '--accent': '#B73A2F' })
    expect(HONORED_TOKENS).not.toContain('success')
    expect(HONORED_TOKENS).not.toContain('danger')
  })

  it('does nothing without a theme, and ignores unreadable text on the host surface', () => {
    expect(themeVariables(undefined)).toEqual({})
    const unreadable = Theme.parse({ mode: 'dark', tokens: { surface: '#13110F', textPrimary: '#1F1B16', accent: '#B73A2F' } })
    expect(themeVariables(unreadable)).toEqual({ '--panel': '#13110F', '--accent': '#B73A2F' })
  })

  it('measures contrast the WCAG way', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0)
    expect(contrastRatio('#777777', '#777777')).toBeCloseTo(1, 5)
  })
})
