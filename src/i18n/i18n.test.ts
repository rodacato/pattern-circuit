import { describe, expect, it } from 'vitest'
import { createTranslator, detectLocale, msg } from '.'

describe('i18n', () => {
  const t = createTranslator({ Hola: 'Hello', 'Nivel {n} · {chapter}': 'Level {n} · {chapter}', 'El mostrador': 'The counter' })

  it('traduce por el texto fuente y cae al español si falta', () => {
    expect(t('Hola')).toBe('Hello')
    expect(t('Sin traducir')).toBe('Sin traducir')
  })

  it('rellena los huecos y traduce también sus valores de texto', () => {
    expect(t(msg('Nivel {n} · {chapter}', { n: 3, chapter: 'El mostrador' }))).toBe('Level 3 · The counter')
    expect(t(msg('Falta {x}', {}))).toBe('Falta {x}')
    expect(t(msg('{greeting}, {who}', { greeting: 'Hola', who: msg('nivel {n}', { n: 2 }) }))).toBe('Hello, nivel 2')
  })

  it('elige el idioma guardado, o el del navegador (español primero)', () => {
    expect(detectLocale('en', ['es-MX'])).toBe('en')
    expect(detectLocale(null, ['es-MX', 'en'])).toBe('es')
    expect(detectLocale(null, ['en-US'])).toBe('en')
    expect(detectLocale(null, [])).toBe('es')
  })
})
