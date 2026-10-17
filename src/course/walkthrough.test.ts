import { describe, expect, it } from 'vitest'
import { walkthroughWanted } from './walkthrough'

describe('walkthroughWanted', () => {
  it('opens on a first visit', () => {
    expect(walkthroughWanted('', null)).toBe(true)
    expect(walkthroughWanted('?debug', null)).toBe(true)
  })

  it('stays closed once seen, or when the URL turns it off', () => {
    expect(walkthroughWanted('', 'seen')).toBe(false)
    expect(walkthroughWanted('?walkthrough=off', null)).toBe(false)
    expect(walkthroughWanted('?level=x&walkthrough=off', null)).toBe(false)
  })
})
