import { expect, type Page } from '@playwright/test'

export type Locale = 'es-MX' | 'en'

// Console errors, uncaught exceptions and failed requests: a run that hides one of these is not a passing run.
export function collectErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`)
  })
  page.on('pageerror', (e) => errors.push(`page: ${e.message}`))
  page.on('requestfailed', (r) => {
    if (r.failure()?.errorText !== 'net::ERR_ABORTED') errors.push(`request: ${r.url()} ${r.failure()?.errorText}`)
  })
  return errors
}

export async function openCourse(page: Page, { locale = 'es-MX', query = '?walkthrough=off' }: { locale?: Locale; query?: string } = {}) {
  await page.addInitScript((l) => {
    if (!localStorage.getItem('pattern-circuit:locale')) localStorage.setItem('pattern-circuit:locale', l)
  }, locale)
  await page.goto(`/${query}`)
  await expect(page.getByTestId('play')).toBeVisible()
}

const CARDS = ['card-win', 'card-fail', 'card-problem', 'card-predict', 'card-note', 'card-ticket', 'card-compare'] as const
type Card = (typeof CARDS)[number] | 'none'

async function idle(page: Page) {
  await expect(page.getByTestId('play')).toHaveAttribute('data-playing', 'false', { timeout: 60_000 })
}

async function currentCard(page: Page): Promise<Card> {
  for (const id of CARDS) if (await page.getByTestId(id).isVisible()) return id
  return 'none'
}

// Everything an action can change on screen; the solver waits for it to move before deciding again.
async function signature(page: Page) {
  const card = await currentCard(page)
  const count = (id: string) => page.getByTestId(id).count()
  const outcome = card === 'card-note' ? await page.getByTestId('card-note').getAttribute('data-outcome') : ''
  const plugged = await page.locator('[data-testid="cartridge"][aria-pressed="true"]').evaluateAll((els) => els.map((e) => e.getAttribute('data-pattern')).join(','))
  const compare = page.getByTestId('ticket-compare')
  const enabled = (await compare.count()) > 0 && (await compare.isEnabled())
  return [card, outcome, plugged, await count('choice'), await count('ticket-apply'), await count('note-continue'), enabled].join('|')
}

async function act(page: Page, action: () => Promise<void>) {
  const before = await signature(page)
  await action()
  await expect.poll(() => signature(page), { timeout: 60_000 }).not.toBe(before)
}

export type Order = 'inventory' | 'reverse'

async function plugNext(page: Page, tried: Set<string>, level: string, order: Order) {
  const free = await page.locator('[data-testid="cartridge"][aria-pressed="false"]').evaluateAll((els) => els.map((e) => e.getAttribute('data-pattern')!))
  for (const pattern of order === 'reverse' ? free.reverse() : free) {
    if (tried.has(pattern)) continue
    tried.add(pattern)
    await act(page, () => page.locator(`[data-testid="cartridge"][data-pattern="${pattern}"]`).press('Enter'))
    return
  }
  throw new Error(`${level}: every cartridge was tried and the level is still unsolved (tried ${[...tried].join(', ')})`)
}

export type LevelRun = { level: string; outcomes: Record<string, string>; ticket: boolean; compared: boolean }

// Plays the open level the way a keyboard player would: every cartridge is tried until the sockets are solved,
// predictions are answered, a ticket is applied, the comparison is read, and the level is finished.
export async function solveLevel(page: Page, order: Order = 'inventory'): Promise<LevelRun> {
  const level = await page.getByRole('combobox').inputValue()
  const run: LevelRun = { level, outcomes: {}, ticket: false, compared: false }
  const tried = new Set<string>()
  const solvers = new Set<string>()
  await page.getByTestId('speed-4').click()
  for (let step = 0; step < 80; step++) {
    await idle(page)
    const card = await currentCard(page)
    if (card === 'card-win') return run
    if (card === 'none') await act(page, () => page.getByTestId('play').click())
    else if (card === 'card-fail') {
      const repair = page.getByTestId('repair')
      if (!(await repair.count())) throw new Error(`${level}: the run failed with nothing to repair`)
      await act(page, () => repair.press('Enter'))
    } else if (card === 'card-predict') await act(page, () => page.getByTestId('choice').first().click())
    else if (card === 'card-problem') await plugNext(page, tried, level, order)
    else if (card === 'card-note') {
      const note = page.getByTestId('card-note')
      const outcome = (await note.getAttribute('data-outcome'))!
      const plugged = await page.locator('[data-testid="cartridge"][aria-pressed="true"]').evaluateAll((els) => els.map((e) => e.getAttribute('data-pattern')!))
      // The note is about the most recently plugged cartridge.
      const last = [...tried].reverse().find((p) => plugged.includes(p))!
      run.outcomes[last] = outcome
      if (outcome === 'solves') solvers.add(last)
      if (await page.getByTestId('note-continue').count()) await act(page, () => page.getByTestId('note-continue').click())
      else if (outcome === 'solves') await plugNext(page, tried, level, order)
      else {
        await act(page, () => page.locator(`[data-testid="cartridge"][data-pattern="${last}"]`).press('Enter'))
        // A misfit for a socket that was already solved replaces its solution: plug that one back.
        const displaced = [...solvers].find((p) => !plugged.includes(p))
        if (displaced) await act(page, () => page.locator(`[data-testid="cartridge"][data-pattern="${displaced}"]`).press('Enter'))
      }
    } else if (card === 'card-ticket') {
      run.ticket = true
      if (await page.getByTestId('choice').count()) await act(page, () => page.getByTestId('choice').first().click())
      else if (await page.getByTestId('ticket-apply').count()) await act(page, () => page.getByTestId('ticket-apply').click())
      else {
        await expect(page.getByTestId('ticket-compare')).toBeEnabled({ timeout: 60_000 })
        await act(page, () => page.getByTestId('ticket-compare').click())
      }
    } else if (card === 'card-compare') {
      run.compared = true
      await expect(page.locator('[data-testid="card-compare"] tbody tr').first()).toBeVisible()
      await act(page, () => page.getByTestId('finish-level').click())
    }
  }
  throw new Error(`${level}: no win after 80 steps (last card: ${await currentCard(page)})`)
}
