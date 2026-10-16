import { createHostController, embeddingFragment, windowTransport, type CourseManifest, type HostCommand, type Progress, type Theme } from '../src/course-kit'

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T
const KEY = 'host-test:state'

type Stored = { locale: string; codeLanguage: string; progress: Progress; rev: number }
const saved = (): Stored => {
  try {
    return { locale: 'en', codeLanguage: 'ruby', progress: { completedUnits: [] }, rev: 0, ...(JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<Stored>) }
  } catch {
    return { locale: 'en', codeLanguage: 'ruby', progress: { completedUnits: [] }, rev: 0 }
  }
}
let state = saved()
const persist = () => {
  localStorage.setItem(KEY, JSON.stringify(state))
  $('progress').textContent = JSON.stringify({ rev: state.rev, ...state.progress }, null, 1)
}

// The three themes of Dojo (apps/web/src/styles/main.css), as the tokens a host would send.
const THEMES: Record<string, Theme> = {
  slate: { mode: 'dark', tokens: { page: '#0F172A', surface: '#1E293B', elevated: '#253347', border: '#334155', textPrimary: '#F8FAFC', textSecondary: '#94A3B8', textMuted: '#64748B', accent: '#6366F1' } },
  sumi: { mode: 'dark', tokens: { page: '#0A0908', surface: '#13110F', elevated: '#1B1815', border: '#2A2520', textPrimary: '#F2EDE3', textSecondary: '#A39A8C', textMuted: '#7A7064', accent: '#B73A2F' } },
  washi: { mode: 'light', tokens: { page: '#F5F1E8', surface: '#EDE7D9', elevated: '#E3DCC9', border: '#C9BFA8', textPrimary: '#1F1B16', textSecondary: '#5C5448', textMuted: '#6F6658', accent: '#B73A2F' } },
}
const chosenTheme = () => THEMES[$<HTMLSelectElement>('theme').value]

const log = (line: string) => {
  const box = $('log')
  box.textContent = `${new Date().toLocaleTimeString()} ${line}\n${box.textContent ?? ''}`.slice(0, 6000)
}

let controller: ReturnType<typeof createHostController> | undefined
const send = (command: HostCommand) => {
  log(`→ host.${command.type}`)
  controller?.send(command)
}

async function load() {
  const url = new URL($<HTMLInputElement>('url').value)
  const courseOrigin = url.origin
  $('frame').replaceChildren()
  controller?.stop()

  const manifest = (await fetch(new URL('course.json', url)).then((r) => r.json())) as CourseManifest
  $('status').textContent = `${manifest.id} ${manifest.version}`
  const locales = $<HTMLSelectElement>('locale')
  locales.replaceChildren(...manifest.locales.map((l) => new Option(l, l, false, l === state.locale)))
  $<HTMLSelectElement>('unit').replaceChildren(...manifest.units.map((u) => new Option(u.id, u.id)))

  const iframe = document.createElement('iframe')
  iframe.title = manifest.title[manifest.defaultLocale] ?? manifest.id
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin')
  iframe.referrerPolicy = 'no-referrer'
  $('frame').append(iframe)
  // The listener is installed before the course is told where to find its host.
  controller = createHostController({
    transport: windowTransport(window, iframe.contentWindow!, courseOrigin),
    supported: { min: 1, max: 1 },
    handlers: {
      init: () => ({ locale: state.locale, codeLanguage: state.codeLanguage, progress: state.progress, reducedMotion: $<HTMLInputElement>('reduced').checked, theme: chosenTheme(), features: { codeRunner: false } }),
      ready: () => log('← ready'),
      unitStarted: (id) => log(`← unit.started ${id}`),
      unitCompleted: (id, detail) => {
        log(`← unit.completed ${id} ${JSON.stringify(detail ?? {})}`)
        state.progress = { ...state.progress, completedUnits: [...new Set([...state.progress.completedUnits, id])] }
        persist()
      },
      courseCompleted: () => log('← course.completed'),
      progress: (rev, progress) => {
        if (rev < state.rev) return
        state = { ...state, rev, progress }
        persist()
        log(`← progress rev ${rev} (${progress.completedUnits.length} units)`)
      },
      preferenceRequested: (p) => {
        log(`← preference ${JSON.stringify(p)}`)
        if (p.locale) state.locale = p.locale
        if (p.codeLanguage) state.codeLanguage = p.codeLanguage
        persist()
        if (p.locale) send({ type: 'locale', value: p.locale })
        if (p.codeLanguage) send({ type: 'codeLanguage', value: p.codeLanguage })
      },
      error: (e) => log(`← error ${e.code}: ${e.message}`),
    },
  })
  iframe.src = new URL(`${url.pathname}${url.search}${embeddingFragment(location.origin, 1)}`, url.origin).href
}

$('load').addEventListener('click', () => void load())
$('locale').addEventListener('change', (e) => {
  state.locale = (e.target as HTMLSelectElement).value
  persist()
  send({ type: 'locale', value: state.locale })
})
$('code').addEventListener('change', (e) => {
  state.codeLanguage = (e.target as HTMLSelectElement).value
  persist()
  send({ type: 'codeLanguage', value: state.codeLanguage })
})
$('theme').addEventListener('change', () => {
  const theme = chosenTheme()
  if (theme) send({ type: 'theme', theme })
  else void load()
})
$('unit').addEventListener('change', (e) => send({ type: 'navigate', unitId: (e.target as HTMLSelectElement).value }))
$('visible').addEventListener('change', (e) => {
  const visible = (e.target as HTMLInputElement).checked
  $('frame').style.visibility = visible ? 'visible' : 'hidden'
  send({ type: 'visibility', visible })
})
$('merge').addEventListener('click', () => {
  const union = [...new Set([...state.progress.completedUnits, 'tutorial', 'strategy', 'factory-method'])]
  state = { ...state, progress: { ...state.progress, completedUnits: union } }
  persist()
  send({ type: 'progress', progress: state.progress })
})
$('reset').addEventListener('click', () => {
  state = { ...state, progress: { completedUnits: [] }, rev: 0 }
  persist()
  send({ type: 'progress', progress: state.progress })
})

persist()
void load()
