import { z } from 'zod'
import { THEME_TOKENS } from './manifest'

// Messages between a course (in an iframe) and its host. Every message is parsed on arrival; what does not
// parse is dropped, unknown fields are stripped and unknown types ignored, so either side can add things.
export const CHANNEL = 'course-kit'
export const PROTOCOL_VERSION = 1

export const LIMITS = { message: 256 * 1024, state: 64 * 1024, files: 100 * 1024 }

const Id = z.string().min(1).max(100)

export const Progress = z.object({
  completedUnits: z.array(Id),
  startedUnits: z.array(Id).optional(),
  state: z.unknown().optional(),
  stateVersion: z.number().int().nonnegative().optional(),
}).refine((p) => JSON.stringify(p.state ?? null).length <= LIMITS.state, 'the course state is too large')
export type Progress = z.infer<typeof Progress>

const COLOR = /^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/
const FONT = /^[\w\s"',.-]{1,200}$/
const RADIUS = /^\d{1,2}px$/
const tokenValue = (name: (typeof THEME_TOKENS)[number]) => (name.startsWith('font') ? FONT : name.startsWith('radius') ? RADIUS : COLOR)

// A theme restyles but cannot load anything: values are colors, font family names and radii, never URLs or CSS.
export const Theme = z.object({
  mode: z.enum(['light', 'dark']),
  tokens: z
    .record(z.string(), z.string())
    .optional()
    .transform((tokens) => Object.fromEntries(Object.entries(tokens ?? {}).filter(([k, v]) => (THEME_TOKENS as readonly string[]).includes(k) && tokenValue(k as (typeof THEME_TOKENS)[number]).test(v)))),
})
export type Theme = z.infer<typeof Theme>

export const RunRequest = z.object({
  language: Id,
  files: z.array(z.object({ path: z.string().min(1).max(200), content: z.string().max(LIMITS.files) })).min(1),
  entry: z.string().min(1),
  timeoutMs: z.number().int().positive().optional(),
})
export type RunRequest = z.infer<typeof RunRequest>

// A discriminated union, never a boolean: the UI must not claim a pass that did not happen.
export const RunOutcome = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('executed'),
    tests: z.array(z.object({ name: z.string(), passed: z.boolean(), message: z.string().optional() })),
    stdout: z.string(),
    stderr: z.string(),
    durationMs: z.number().nonnegative(),
    errorKind: z.enum(['runtime', 'compile', 'timeout', 'sandbox', 'output-exceeded']).optional(),
  }),
  z.object({ kind: z.literal('syntax-checked'), diagnostics: z.array(z.object({ line: z.number().int().positive(), message: z.string() })) }),
  z.object({ kind: z.literal('unavailable'), reason: z.string() }),
])
export type RunOutcome = z.infer<typeof RunOutcome>

export const HostInit = z.object({
  protocol: z.number().int().positive(),
  locale: z.string().min(1),
  codeLanguage: z.string().min(1).optional(),
  theme: Theme.optional(),
  reducedMotion: z.boolean().optional(),
  progress: Progress.nullable(),
  features: z.object({ codeRunner: z.boolean() }),
  unitId: Id.optional(),
})
export type HostInit = z.infer<typeof HostInit>

const envelope = <T extends string, P extends z.ZodType>(type: T, payload: P) =>
  z.object({ channel: z.literal(CHANNEL), v: z.number().int().positive(), type: z.literal(type), id: z.string().min(1).max(100), replyTo: z.string().optional(), payload })

const Range = z.object({ min: z.number().int().positive(), max: z.number().int().positive() })

export const CourseMessage = z.discriminatedUnion('type', [
  envelope('course.hello', z.object({ courseId: Id, courseVersion: z.string(), protocol: Range })),
  envelope('course.ready', z.object({})),
  envelope('course.unit.started', z.object({ unitId: Id })),
  envelope('course.unit.completed', z.object({ unitId: Id, detail: z.record(z.string(), z.union([z.number(), z.string(), z.boolean()])).optional() })),
  envelope('course.completed', z.object({})),
  envelope('course.progress', z.object({ rev: z.number().int().nonnegative(), progress: Progress })),
  envelope('course.preference.requested', z.object({ locale: z.string().optional(), codeLanguage: z.string().optional() })),
  envelope('course.code.run', z.object({ request: RunRequest })),
  envelope('course.resize', z.object({ height: z.number().positive() })),
  envelope('course.error', z.object({ code: z.string(), message: z.string().max(500) })),
])
export type CourseMessage = z.infer<typeof CourseMessage>

export const HostMessage = z.discriminatedUnion('type', [
  envelope('host.init', HostInit),
  envelope('host.locale', z.object({ value: z.string().min(1) })),
  envelope('host.codeLanguage', z.object({ value: z.string().min(1) })),
  envelope('host.theme', z.object({ theme: Theme })),
  envelope('host.progress', z.object({ progress: Progress })),
  envelope('host.visibility', z.object({ visible: z.boolean() })),
  envelope('host.navigate', z.object({ unitId: Id })),
  envelope('host.code.result', z.object({ outcome: RunOutcome })),
  envelope('host.incompatible', z.object({ hostProtocol: Range })),
])
export type HostMessage = z.infer<typeof HostMessage>

export type CourseEvent =
  | { type: 'unit.started'; unitId: string }
  | { type: 'unit.completed'; unitId: string; detail?: Record<string, number | string | boolean> }
  | { type: 'completed' }
  | { type: 'progress'; rev: number; progress: Progress }
  | { type: 'preference.requested'; locale?: string; codeLanguage?: string }
  | { type: 'error'; code: string; message: string }

export type HostCommand =
  | { type: 'locale'; value: string }
  | { type: 'codeLanguage'; value: string }
  | { type: 'theme'; theme: Theme }
  | { type: 'progress'; progress: Progress }
  | { type: 'visibility'; visible: boolean }
  | { type: 'navigate'; unitId: string }

// Messages are small: anything over the cap is dropped before parsing.
export function parseCourseMessage(data: unknown): CourseMessage | undefined {
  return withinLimit(data) ? CourseMessage.safeParse(data).data : undefined
}

export function parseHostMessage(data: unknown): HostMessage | undefined {
  return withinLimit(data) ? HostMessage.safeParse(data).data : undefined
}

function withinLimit(data: unknown): boolean {
  try {
    return JSON.stringify(data).length <= LIMITS.message
  } catch {
    return false
  }
}
