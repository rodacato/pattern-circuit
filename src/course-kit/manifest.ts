import { z } from 'zod'

// What a course publishes at `<its base URL>/course.json` so a host can list its units without loading the course.
export const THEME_TOKENS = [
  'page', 'surface', 'elevated', 'border',
  'accent', 'onAccent', 'success', 'danger', 'warning',
  'textPrimary', 'textSecondary', 'textMuted',
  'fontSans', 'fontMono', 'radiusSm', 'radiusMd',
] as const
export type ThemeTokenName = (typeof THEME_TOKENS)[number]

const Localized = z.record(z.string().min(1), z.string().min(1))
const Slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)

export const CourseManifest = z
  .object({
    schema: z.literal(1),
    id: Slug,
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    protocol: z.object({ min: z.number().int().positive(), max: z.number().int().positive() }),
    title: Localized,
    description: Localized,
    locales: z.array(z.string().min(1)).min(1),
    defaultLocale: z.string().min(1),
    codeLanguages: z.array(z.string().min(1)),
    defaultCodeLanguage: z.string().min(1).optional(),
    entry: z.string().min(1),
    groups: z.array(z.object({ id: Slug, title: Localized })).min(1),
    units: z
      .array(z.object({ id: Slug, group: Slug, title: Localized, estimatedMinutes: z.number().positive().optional() }))
      .min(1),
    completion: z.object({ requires: z.union([z.literal('all'), z.array(Slug).min(1)]) }),
    capabilities: z.object({
      codeRunner: z.enum(['none', 'optional']),
      theming: z.object({ modes: z.array(z.enum(['light', 'dark'])).min(1), honors: z.array(z.enum(THEME_TOKENS)) }).optional(),
      minViewport: z.object({ width: z.number().int().positive(), height: z.number().int().positive() }).optional(),
      persistsOwnState: z.boolean(),
    }),
  })
  .superRefine((m, ctx) => {
    const issue = (message: string) => ctx.addIssue({ code: 'custom', message })
    if (m.protocol.min > m.protocol.max) issue('protocol.min is greater than protocol.max')
    if (!m.locales.includes(m.defaultLocale)) issue(`defaultLocale ${m.defaultLocale} is not in locales`)
    if (m.defaultCodeLanguage && !m.codeLanguages.includes(m.defaultCodeLanguage)) issue(`defaultCodeLanguage ${m.defaultCodeLanguage} is not in codeLanguages`)
    const groups = new Set(m.groups.map((g) => g.id))
    const units = new Set(m.units.map((u) => u.id))
    if (groups.size !== m.groups.length) issue('duplicate group id')
    if (units.size !== m.units.length) issue('duplicate unit id')
    for (const u of m.units) if (!groups.has(u.group)) issue(`unit ${u.id} is in unknown group ${u.group}`)
    if (m.completion.requires !== 'all') for (const id of m.completion.requires) if (!units.has(id)) issue(`completion requires unknown unit ${id}`)
    for (const text of [m.title, m.description, ...m.groups.map((g) => g.title), ...m.units.map((u) => u.title)])
      for (const locale of m.locales) if (!text[locale]) issue(`a text is missing its ${locale} version`)
  })

export type CourseManifest = z.infer<typeof CourseManifest>
