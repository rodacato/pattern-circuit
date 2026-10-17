import { expect, test } from '@playwright/test'
import { collectErrors, openCourse, solveLevel, type LevelRun, type Locale, type Order } from './course.ts'

// Two walks through the whole course. The second tries the cartridges in the opposite order, so between them most
// misfit notes are played at least once; the first reloads halfway to check that progress survives.
const walks: { locale: Locale; viewport: { width: number; height: number }; order: Order; reloadAfter?: string }[] = [
  { locale: 'es-MX', viewport: { width: 1280, height: 720 }, order: 'inventory', reloadAfter: 'proxy' },
  { locale: 'en', viewport: { width: 1440, height: 900 }, order: 'reverse' },
]

const TICKETS = 8

for (const w of walks) {
  test.describe(`whole course · ${w.locale} · ${w.viewport.width}x${w.viewport.height} · ${w.order}`, () => {
    test.use({ viewport: w.viewport })

    test('every level is solved from the UI, without errors, and the progress adds up', async ({ page }) => {
      test.setTimeout(30 * 60_000)
      const errors = collectErrors(page)
      await openCourse(page, { locale: w.locale })
      const levels = page.getByRole('combobox')
      const total = await levels.locator('option').count()
      const runs: LevelRun[] = []

      for (let i = 0; i < total; i++) {
        const id = await levels.inputValue()
        await test.step(id, async () => {
          runs.push(await solveLevel(page, w.order))
        })
        if (id === w.reloadAfter) {
          await page.reload()
          await expect(levels.locator(`option[value="${id}"]`)).toHaveText(/^✓/)
          await expect(levels).not.toHaveValue(id)
        } else if (i < total - 1) await page.getByTestId('next-level').click()
      }

      expect(runs.map((r) => r.level)).toHaveLength(total)
      expect(new Set(runs.map((r) => r.level)).size).toBe(total)
      expect(runs.filter((r) => r.ticket)).toHaveLength(TICKETS)
      for (const r of runs.filter((r) => Object.keys(r.outcomes).length)) expect(r.compared, `${r.level} reached the comparison`).toBe(true)
      await expect(levels.locator('option')).toHaveText(Array(total).fill(/^✓/))
      await expect(page.getByTestId('next-level')).toHaveCount(0)

      await page.getByTestId('notebook').click()
      const notebook = page.getByRole('dialog')
      await expect(notebook.locator('h3').first()).toBeVisible()
      await page.keyboard.press('Escape')
      await expect(notebook).toBeHidden()

      await page.getByTestId('review').click()
      const review = page.getByRole('dialog')
      await review.locator('.review-question .choices button').first().click()
      await expect(review.locator('.review-question .note')).toBeVisible()
      await page.keyboard.press('Escape')

      expect(errors).toEqual([])
    })
  })
}

test('the code of an inspected node is shown in the three languages, from the keyboard panel', async ({ page }) => {
  const errors = collectErrors(page)
  await openCourse(page)
  await page.getByRole('combobox').selectOption('strategy')
  await page.locator('.explorer summary').click()
  await page.locator('.explorer li button').nth(1).press('Enter')

  const active = page.locator('.code-body .line.on').first()
  for (const lang of ['Ruby', 'TypeScript', 'Python']) {
    await page.locator('.lang-switch button', { hasText: lang }).click()
    await expect(page.locator('.lang-switch button', { hasText: lang })).toHaveAttribute('aria-pressed', 'true')
    await expect(active).toBeVisible()
  }
  expect(errors).toEqual([])
})
