import { CourseManifest, PROTOCOL_VERSION, THEME_TOKENS } from '../course-kit'
import { createTranslator, type Message } from '../i18n'
import { APP_CATALOGS, CANONICAL_LOCALE, LOCALES } from '../i18n/registry'
import { LEVELS, LEVEL_CATALOGS, TRACKS } from '../levels'
import { HOST_LANGUAGES } from './codeLanguages'

declare const __APP_VERSION__: string

// The ficha a host reads (`public/course.json`): derived from the levels, so it cannot drift from the game.
export function buildManifest(): CourseManifest {
  const translators = Object.fromEntries(
    LOCALES.map((l) => [l, createTranslator([APP_CATALOGS[l], LEVEL_CATALOGS[l], APP_CATALOGS[CANONICAL_LOCALE], LEVEL_CATALOGS[CANONICAL_LOCALE]].filter((c) => c !== undefined))]),
  )
  const localized = (text: Message) => Object.fromEntries(LOCALES.map((l) => [l, translators[l](text)]))
  const track = TRACKS[0]

  return CourseManifest.parse({
    schema: 1,
    id: 'pattern-circuit',
    version: __APP_VERSION__,
    protocol: { min: PROTOCOL_VERSION, max: PROTOCOL_VERSION },
    title: localized(track.name),
    description: localized('ui.course.description'),
    locales: LOCALES,
    defaultLocale: CANONICAL_LOCALE,
    codeLanguages: HOST_LANGUAGES,
    defaultCodeLanguage: HOST_LANGUAGES[0],
    entry: './index.html',
    groups: Object.entries(track.chapters).map(([id, name]) => ({ id, title: localized(name) })),
    units: LEVELS.map((l) => ({ id: l.id, group: l.chapter, title: localized(l.title) })),
    completion: { requires: 'all' },
    capabilities: {
      codeRunner: 'none',
      theming: { modes: ['dark'], honors: [...THEME_TOKENS] },
      minViewport: { width: 640, height: 480 },
      persistsOwnState: true,
    },
  })
}
