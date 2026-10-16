import { describe, expect, it } from 'vitest'
import { emptyProgress } from '../game/progress/progress'
import { createBrowserStorage } from './browserStorage'
import { fromHostLanguage, toHostLanguage } from './codeLanguages'
import { startCourse } from './startCourse'

const fakeStorage = (initial: Record<string, string> = {}) => {
  const data = { ...initial }
  return { data, getItem: (k: string) => data[k] ?? null, setItem: (k: string, v: string) => void (data[k] = v) }
}

describe('browser storage', () => {
  it('keeps progress and both preferences under the keys of v1.1', () => {
    const raw = fakeStorage()
    const storage = createBrowserStorage(raw)
    storage.locale.save('en')
    storage.codeLanguage.save('ts')
    storage.progress.save({ ...emptyProgress(), completed: ['strategy'] })
    expect(raw.data['pattern-circuit:locale']).toBe('en')
    expect(raw.data['pattern-circuit:code']).toBe('ts')
    expect(JSON.parse(raw.data['pattern-circuit:progress']).completed).toEqual(['strategy'])
  })

  it('does not throw when the storage is missing or blocked', () => {
    const blocked = { getItem: () => { throw new Error('blocked') }, setItem: () => { throw new Error('blocked') } }
    for (const storage of [createBrowserStorage(undefined), createBrowserStorage(blocked)]) {
      expect(storage.locale.load()).toBeNull()
      expect(() => storage.codeLanguage.save('ts')).not.toThrow()
      expect(storage.progress.load().completed).toEqual([])
    }
  })
})

describe('code languages', () => {
  it('map between the code panel and the ids of the hub', () => {
    expect(toHostLanguage('rb')).toBe('ruby')
    expect(fromHostLanguage('typescript')).toBe('ts')
    expect(fromHostLanguage('python')).toBeUndefined()
  })
})

describe('startCourse', () => {
  it('starts standalone with the browser language and the code language it remembers', async () => {
    const course = await startCourse(['en-US'])
    expect(course.bridge.mode).toBe('standalone')
    expect(course.init).toMatchObject({ protocol: 1, locale: 'en', codeLanguage: 'ruby', progress: null, features: { codeRunner: false } })
  })
})
