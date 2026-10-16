import { PROTOCOL_VERSION, StandaloneHostBridge, type HostBridge, type HostInit } from '../course-kit'
import { detectLocale } from '../i18n/registry'
import { createBrowserStorage, type BrowserStorage } from './browserStorage'
import { fromHostLanguage, toHostLanguage } from './codeLanguages'

export type Course = { bridge: HostBridge; init: HostInit; storage: BrowserStorage }

// What the browser itself knows: used when there is no host, and as the base the host's answers are applied to.
function standaloneInit(storage: BrowserStorage, languages: readonly string[]): HostInit {
  return {
    protocol: PROTOCOL_VERSION,
    locale: detectLocale(storage.locale.load(), languages),
    codeLanguage: toHostLanguage(storage.codeLanguage.load() === 'ts' ? 'ts' : 'rb'),
    progress: null,
    features: { codeRunner: false },
  }
}

export async function startCourse(languages: readonly string[] = navigator.languages ?? []): Promise<Course> {
  const storage = createBrowserStorage()
  const bridge = new StandaloneHostBridge(() => standaloneInit(storage, languages))
  return { bridge, init: await bridge.start(), storage }
}

// The code language the course starts with, as the code panel names it.
export const initialCodeLanguage = (init: HostInit) => fromHostLanguage(init.codeLanguage) ?? 'rb'
