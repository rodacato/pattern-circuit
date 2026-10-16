// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { emptyProgress, MemoryProgressStore } from '../game/progress/progress'
import { GameSession } from '../game/session/GameSession'
import { LEVELS } from '../levels'
import { BriefCard } from './BriefCard'
import { StageCard } from './cards/StageCard'
import { CodePanel } from './CodePanel'
import { I18nProvider } from './I18nProvider'
import { Inventory } from './Inventory'
import { Notebook } from './Notebook'
import { Review } from './Review'
import { isShortcut } from './shortcuts'
import { Transport } from './Transport'

afterEach(cleanup)
Element.prototype.scrollIntoView = () => {} // jsdom does not implement scroll

const session = (id: string, store = new MemoryProgressStore()) => new GameSession(LEVELS.find((l) => l.id === id)!, store)
const runOut = (s: GameSession) =>
  act(() => {
    if (!s.playback.playing) s.play()
    for (let i = 0; i < 10_000 && s.playback.playing; i++) s.update(1)
  })
const keyboardClick = (el: HTMLElement) => fireEvent.click(el, { detail: 0 })

describe('Transport', () => {
  it('every control has an accessible name and the active speed is marked', () => {
    const s = session('tutorial')
    render(
      <I18nProvider locale="es-MX">
        <Transport session={s} />
      </I18nProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Paso adelante' }))
    expect(s.playback.timeline.tick).toBe(1)
    fireEvent.click(screen.getByRole('button', { name: 'Velocidad 2×' }))
    expect(screen.getByRole('button', { name: 'Velocidad 2×' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: 'Reproducir' })).toBeTruthy()
  })
})

describe('BriefCard', () => {
  it('shows the level stages and marks the current one', () => {
    const s = session('strategy')
    render(
      <I18nProvider locale="es-MX">
        <BriefCard session={s} />
      </I18nProvider>,
    )
    const steps = [...document.querySelectorAll('.stages li')].map((li) => li.textContent)
    expect(steps).toEqual(['Observar', 'Elegir patrón', 'Cambio', 'Comparar'])
    expect(document.querySelector('[aria-current="step"]')?.textContent).toBe('Observar')
    runOut(s)
    expect(document.querySelector('[aria-current="step"]')?.textContent).toBe('Elegir patrón')
  })
})

describe('Inventory', () => {
  it('appears when seeing the problem; with the keyboard it plugs and a second click unplugs', () => {
    const s = session('strategy')
    const { container } = render(
      <I18nProvider locale="es-MX">
        <Inventory session={s} />
      </I18nProvider>,
    )
    expect(container.innerHTML).toBe('')
    runOut(s)
    const strategy = screen.getByRole('button', { name: /^Strategy/ })
    keyboardClick(strategy)
    expect(s.pluggedPatterns).toEqual(['strategy'])
    expect(strategy.getAttribute('aria-pressed')).toBe('true')
    keyboardClick(strategy)
    expect(s.pluggedPatterns).toEqual([])
  })

  it('after trying a pattern it shows its result', () => {
    const s = session('strategy')
    render(
      <I18nProvider locale="es-MX">
        <Inventory session={s} />
      </I18nProvider>,
    )
    runOut(s)
    keyboardClick(screen.getByRole('button', { name: /^Observer/ }))
    runOut(s)
    expect(screen.getByRole('button', { name: /^Observer/ }).getAttribute('aria-label')).toContain('no encaja')
  })
})

describe('StageCard', () => {
  it('after failing level 0 it offers to connect the wire without dragging', () => {
    const s = session('tutorial')
    render(
      <I18nProvider locale="es-MX">
        <StageCard session={s} onNext={() => {}} />
      </I18nProvider>,
    )
    runOut(s)
    expect(screen.getByRole('status').textContent).toContain('Algo salió mal')
    fireEvent.click(screen.getByRole('button', { name: /Conectar Preparar → Entregar/ }))
    runOut(s)
    expect(s.flow.stage).toBe('complete')
    expect(screen.getByRole('status').textContent).toContain('Nivel superado')
  })

  it('the comparison marks the active side and lists the metrics that change', () => {
    const s = session('strategy')
    render(
      <I18nProvider locale="es-MX">
        <StageCard session={s} onNext={() => {}} />
      </I18nProvider>,
    )
    runOut(s)
    act(() => void s.plug('strategy'))
    runOut(s) // running without answering skips the prediction
    fireEvent.click(screen.getByRole('button', { name: /Siguiente: llega un cambio/ }))
    fireEvent.click(screen.getByRole('button', { name: /Ninguna/ }))
    expect(s.flow.ticket).not.toBe('open')
    runOut(s)
    fireEvent.click(screen.getByRole('button', { name: /Comparar sin\/con/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Sin patrón' }))
    expect(screen.getByRole('button', { name: 'Sin patrón' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getAllByRole('row').length).toBe(1 + s.comparisonRows.length)
  })
})

describe('hints', () => {
  it('they are revealed one at a time until the pattern is named', () => {
    const s = session('strategy')
    render(
      <I18nProvider locale="es-MX">
        <StageCard session={s} onNext={() => {}} />
      </I18nProvider>,
    )
    runOut(s)
    for (let i = 0; i < 4; i++) fireEvent.click(screen.getByRole('button', { name: /pista/ }))
    expect(screen.getAllByRole('listitem').at(-1)?.textContent).toBe('Prueba con Strategy.')
    expect(screen.queryByRole('button', { name: /pista/ })).toBeNull()
  })
})

describe('predictions', () => {
  it('when plugging it asks first and, after the run, says whether it was right', () => {
    const s = session('strategy')
    render(
      <I18nProvider locale="es-MX">
        <StageCard session={s} onNext={() => {}} />
      </I18nProvider>,
    )
    runOut(s)
    act(() => void s.plug('observer'))
    expect(screen.getByRole('status').textContent).toContain('¿qué hará Observer')
    fireEvent.click(screen.getByRole('button', { name: 'No encaja aquí' }))
    runOut(s)
    expect(screen.getByRole('status').textContent).toContain('Acertaste')
  })
})

describe('CodePanel', () => {
  it('in the comparison it offers to view the code changes', () => {
    const s = session('strategy')
    render(
      <I18nProvider locale="es-MX">
        <CodePanel session={s} />
      </I18nProvider>,
    )
    expect(screen.queryByRole('tab', { name: 'Cambios' })).toBeNull()
    runOut(s)
    act(() => void s.plug('strategy'))
    runOut(s)
    act(() => s.continue())
    act(() => s.skipPrediction())
    runOut(s)
    act(() => s.continue())
    fireEvent.click(screen.getByRole('tab', { name: 'Cambios' }))
    expect(screen.getByText(/Lo que cambió con el ticket, con Strategy/)).toBeTruthy()
    expect(document.querySelectorAll('.line.add').length).toBeGreaterThan(0)
  })
})

describe('Notebook', () => {
  it('when empty it invites trying patterns; Escape closes', () => {
    const onClose = vi.fn()
    render(
      <I18nProvider locale="es-MX">
        <Notebook levels={LEVELS} notes={[]} onClose={onClose} onReset={() => {}} />
      </I18nProvider>,
    )
    expect(screen.getByRole('dialog').textContent).toContain('Todavía vacío')
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('groups notes by pattern and clears progress only if confirmed', () => {
    const onReset = vi.fn()
    render(
      <I18nProvider locale="es-MX">
        <Notebook levels={LEVELS} notes={['strategy:observer', 'observer:observer']} onClose={() => {}} onReset={onReset} />
      </I18nProvider>,
    )
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('2 notas de campo')
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(1)
    expect(screen.getByRole('link', { name: /Ver fuente/ }).getAttribute('href')).toContain('Observable')
    fireEvent.click(screen.getByRole('button', { name: 'Borrar progreso' }))
    expect(screen.getByRole('alert').textContent).toContain('¿Borrar todo el progreso?')
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onReset).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Borrar progreso' }))
    fireEvent.click(screen.getByRole('button', { name: 'Sí, borrar todo' }))
    expect(onReset).toHaveBeenCalledOnce()
  })
})

describe('Review', () => {
  it('asks about a completed level, explains the answer and records it in the progress', () => {
    const store = new MemoryProgressStore({ ...emptyProgress(), completed: ['strategy'] })
    const s = session('tutorial', store)
    render(
      <I18nProvider locale="es-MX">
        <Review session={s} levels={LEVELS} onClose={() => {}} />
      </I18nProvider>,
    )
    expect(screen.getByRole('dialog').textContent).toContain('¿Efectivo o tarjeta?')
    fireEvent.click(screen.getByRole('button', { name: /^Observer/ }))
    expect(screen.getByText(/La respuesta era Strategy/)).toBeTruthy()
    expect(store.load().review['strategy/payment-method']).toMatchObject({ box: 1 })
    fireEvent.click(screen.getByRole('button', { name: 'Ver resultado' }))
    expect(screen.getByRole('dialog').textContent).toContain('Acertaste 0 de 1')
  })

  it('without completed levels nothing is pending', () => {
    render(
      <I18nProvider locale="es-MX">
        <Review session={session('tutorial')} levels={LEVELS} onClose={() => {}} />
      </I18nProvider>,
    )
    expect(screen.getByRole('dialog').textContent).toContain('Nada pendiente')
  })
})

describe('keyboard shortcuts', () => {
  it('they do not fire with modifiers or over controls', () => {
    const plain = { metaKey: false, ctrlKey: false, altKey: false, target: document.body }
    expect(isShortcut(plain)).toBe(true)
    expect(isShortcut({ ...plain, metaKey: true })).toBe(false)
    expect(isShortcut({ ...plain, target: document.createElement('button') })).toBe(false)
  })
})
