import { expect, test } from '@playwright/test'
import { COURSE_PORT, HOST_PORT } from '../playwright.config.ts'
import { collectErrors, openCourse, solveLevel } from './course.ts'

test('the tutorial is finished with the keyboard alone', { tag: '@smoke' }, async ({ page }) => {
  const errors = collectErrors(page)
  await openCourse(page)
  await expect(page.getByRole('combobox')).toHaveValue('tutorial')

  await page.keyboard.press('Space')
  await expect(page.getByTestId('card-fail')).toBeVisible({ timeout: 60_000 })
  await page.getByTestId('repair').focus()
  await page.keyboard.press('Enter')
  await expect(page.getByTestId('card-win')).toBeVisible({ timeout: 60_000 })
  await expect(page.getByTestId('next-level')).toBeVisible()
  expect(errors).toEqual([])
})

test('a level with a socket goes from the problem to the comparison and leaves notes', { tag: '@smoke' }, async ({ page }) => {
  test.setTimeout(240_000)
  const errors = collectErrors(page)
  await openCourse(page)
  await page.getByRole('combobox').selectOption('strategy')

  const run = await solveLevel(page)
  expect(run.compared).toBe(true)
  expect(Object.values(run.outcomes)).toContain('solves')
  await expect(page.getByTestId('card-win')).toBeVisible()

  await page.reload()
  await expect(page.getByRole('combobox').locator('option[value="strategy"]')).toHaveText(/^✓/)
  expect(errors).toEqual([])
})

test('the guide opens on a first visit, stays closed after it, and the help button replays it', { tag: '@smoke' }, async ({ page }) => {
  await openCourse(page, { query: '' })
  const guide = page.getByTestId('walkthrough')
  await expect(guide).toBeVisible()
  for (let i = 0; i < 3; i++) await page.getByTestId('walkthrough-next').click()
  await page.getByTestId('walkthrough-next').click()
  await expect(guide).toBeHidden()

  await page.reload()
  await expect(page.getByTestId('play')).toBeVisible()
  await expect(guide).toBeHidden()

  await page.getByTestId('help').click()
  await expect(guide).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(guide).toBeHidden()
})

test('?walkthrough=off keeps the guide away on a first visit, and help still opens it', { tag: '@smoke' }, async ({ page }) => {
  await openCourse(page, { query: '?walkthrough=off' })
  await expect(page.getByTestId('walkthrough')).toBeHidden()
  await page.getByTestId('help').click()
  await expect(page.getByTestId('walkthrough')).toBeVisible()
})

test('embedded in the test host: handshake, reported completion and host progress', { tag: '@smoke' }, async ({ page }) => {
  await page.goto(`http://localhost:${HOST_PORT}/`)
  await page.locator('#url').fill(`http://localhost:${COURSE_PORT}/?walkthrough=off`)
  await page.locator('#load').click()
  const course = page.frameLocator('#frame iframe')
  await expect(page.locator('#log')).toContainText('← ready', { timeout: 30_000 })
  await expect(course.getByTestId('play')).toBeVisible()

  await course.getByTestId('play').click()
  await course.getByTestId('repair').click({ timeout: 60_000 })
  await expect(course.getByTestId('card-win')).toBeVisible({ timeout: 60_000 })
  await expect(page.locator('#log')).toContainText('← unit.completed tutorial')
  await expect(page.locator('#progress')).toContainText('tutorial')
  await expect(page.locator('#log')).not.toContainText('← error')
})
