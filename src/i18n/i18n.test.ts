import { describe, expect, it } from 'vitest'
import { createTranslator, msg } from '.'
import { CANONICAL_LOCALE, detectLocale, LOCALES, LOCALE_META, matchLocale, nextLocale } from './registry'

describe('translator', () => {
  const es = { 'ui.hello': 'Hola', 'ui.level': 'Nivel {n} · {chapter}', 'chapter.counter': 'El mostrador' }
  const en = { 'ui.hello': 'Hello', 'ui.level': 'Level {n} · {chapter}', 'chapter.counter': 'The counter', 'ui.onlyEnglish': 'Only English' }
  const t = createTranslator([es, en])

  it('translates by key and falls back to the next catalog, then to the key itself', () => {
    expect(t('ui.hello')).toBe('Hola')
    expect(t('ui.onlyEnglish')).toBe('Only English')
    expect(t('ui.missing')).toBe('ui.missing')
  })

  it('fills the holes and also translates their values', () => {
    expect(t(msg('ui.level' as never, { n: 3, chapter: 'chapter.counter' }))).toBe('Nivel 3 · El mostrador')
    expect(t(msg('ui.level' as never, { n: 3 }))).toBe('Nivel 3 · {chapter}')
    expect(t(msg('ui.level' as never, { n: 1, chapter: msg('ui.hello' as never, {}) }))).toBe('Nivel 1 · Hola')
  })

  it('falls back to the shared vocabulary of the levels', () => {
    const levels = createTranslator([{ 'levels.shared.node.charge': 'Cobrar', 'levels.strategy.node.take': 'Tomar' }])
    expect(levels('levels.strategy.node.charge')).toBe('Cobrar')
    expect(levels('levels.strategy.node.take')).toBe('Tomar')
    expect(levels('levels.strategy.node.other')).toBe('levels.strategy.node.other')
  })
})

describe('registry', () => {
  it('is the list of locale folders, Spanish first, with the canonical locale among them', () => {
    expect(LOCALES).toContain(CANONICAL_LOCALE)
    expect(LOCALES[0]).toBe('es-MX')
    expect(LOCALES.every((l) => LOCALE_META[l].short && LOCALE_META[l].name)).toBe(true)
  })

  it('matches a language tag to the locale of the same language', () => {
    expect(matchLocale('es')).toBe('es-MX')
    expect(matchLocale('es-AR')).toBe('es-MX')
    expect(matchLocale('en-GB')).toBe('en')
    expect(matchLocale('fr')).toBeUndefined()
  })

  it('picks the saved language, or the browser language (Spanish first)', () => {
    expect(detectLocale('en', ['es-MX'])).toBe('en')
    expect(detectLocale('es', ['en'])).toBe('es-MX') // saved by 1.1 as "es"
    expect(detectLocale('xx', ['en-US'])).toBe('en')
    expect(detectLocale(null, ['es-MX', 'en'])).toBe('es-MX')
    expect(detectLocale(null, ['en-US', 'es-419'])).toBe('es-MX')
    expect(detectLocale(null, ['en-US'])).toBe('en')
    expect(detectLocale(null, ['fr-FR'])).toBe('en')
    expect(detectLocale(null, [])).toBe('es-MX')
  })

  it('cycles through the languages', () => {
    expect(nextLocale(LOCALES[0])).toBe(LOCALES[1])
    expect(nextLocale(LOCALES.at(-1)!)).toBe(LOCALES[0])
  })
})
