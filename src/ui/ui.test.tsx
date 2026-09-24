// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { emptyProgress, MemoryProgressStore } from '../game/progress/progress'
import { GameSession } from '../game/session/GameSession'
import { LEVELS } from '../levels'
import { BriefCard } from './BriefCard'
import { StageCard } from './cards/StageCard'
import { CodePanel } from './CodePanel'
import { Inventory } from './Inventory'
import { Notebook } from './Notebook'
import { Review } from './Review'
import { isShortcut } from './shortcuts'
import { Transport } from './Transport'

afterEach(cleanup)
Element.prototype.scrollIntoView = () => {} // jsdom no implementa scroll

const session = (id: string, store = new MemoryProgressStore()) => new GameSession(LEVELS.find((l) => l.id === id)!, store)
const runOut = (s: GameSession) =>
  act(() => {
    if (!s.playback.playing) s.play()
    for (let i = 0; i < 10_000 && s.playback.playing; i++) s.update(1)
  })
const keyboardClick = (el: HTMLElement) => fireEvent.click(el, { detail: 0 })

describe('Transport', () => {
  it('cada control tiene nombre accesible y la velocidad activa se marca', () => {
    const s = session('L00-tutorial')
    render(<Transport session={s} />)
    fireEvent.click(screen.getByRole('button', { name: 'Paso adelante' }))
    expect(s.playback.timeline.tick).toBe(1)
    fireEvent.click(screen.getByRole('button', { name: 'Velocidad 2×' }))
    expect(screen.getByRole('button', { name: 'Velocidad 2×' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: 'Reproducir' })).toBeTruthy()
  })
})

describe('BriefCard', () => {
  it('muestra las etapas del nivel y marca la actual', () => {
    const s = session('L01-strategy')
    render(<BriefCard session={s} />)
    const steps = [...document.querySelectorAll('.stages li')].map((li) => li.textContent)
    expect(steps).toEqual(['Observar', 'Elegir patrón', 'Cambio', 'Comparar'])
    expect(document.querySelector('[aria-current="step"]')?.textContent).toBe('Observar')
    runOut(s)
    expect(document.querySelector('[aria-current="step"]')?.textContent).toBe('Elegir patrón')
  })
})

describe('Inventory', () => {
  it('aparece al ver el problema; con teclado enchufa y un segundo clic desenchufa', () => {
    const s = session('L01-strategy')
    const { container } = render(<Inventory session={s} />)
    expect(container.innerHTML).toBe('')
    runOut(s)
    const strategy = screen.getByRole('button', { name: /^Strategy/ })
    keyboardClick(strategy)
    expect(s.pluggedPatterns).toEqual(['strategy'])
    expect(strategy.getAttribute('aria-pressed')).toBe('true')
    keyboardClick(strategy)
    expect(s.pluggedPatterns).toEqual([])
  })

  it('tras probar un patrón muestra su resultado', () => {
    const s = session('L01-strategy')
    render(<Inventory session={s} />)
    runOut(s)
    keyboardClick(screen.getByRole('button', { name: /^Observer/ }))
    runOut(s)
    expect(screen.getByRole('button', { name: /^Observer/ }).getAttribute('aria-label')).toContain('no encaja')
  })
})

describe('StageCard', () => {
  it('tras fallar el nivel 0 ofrece conectar el cable sin arrastrar', () => {
    const s = session('L00-tutorial')
    render(<StageCard session={s} onNext={() => {}} />)
    runOut(s)
    expect(screen.getByRole('status').textContent).toContain('Algo salió mal')
    fireEvent.click(screen.getByRole('button', { name: /Conectar Preparar → Entregar/ }))
    runOut(s)
    expect(s.flow.stage).toBe('complete')
    expect(screen.getByRole('status').textContent).toContain('Nivel superado')
  })

  it('la comparación marca el lado activo y lista las métricas que cambian', () => {
    const s = session('L01-strategy')
    render(<StageCard session={s} onNext={() => {}} />)
    runOut(s)
    act(() => void s.plug('strategy'))
    runOut(s) // correr sin responder omite la predicción
    fireEvent.click(screen.getByRole('button', { name: /Siguiente: llega un cambio/ }))
    fireEvent.click(screen.getByRole('button', { name: /Ninguna/ }))
    expect(s.flow.ticketApplied).toBe(true)
    runOut(s)
    fireEvent.click(screen.getByRole('button', { name: /Comparar sin\/con/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Sin patrón' }))
    expect(screen.getByRole('button', { name: 'Sin patrón' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getAllByRole('row').length).toBe(1 + s.comparisonRows.length)
  })
})

describe('pistas', () => {
  it('se revelan de a una hasta nombrar el patrón', () => {
    const s = session('L01-strategy')
    render(<StageCard session={s} onNext={() => {}} />)
    runOut(s)
    for (let i = 0; i < 4; i++) fireEvent.click(screen.getByRole('button', { name: /pista/ }))
    expect(screen.getAllByRole('listitem').at(-1)?.textContent).toBe('Prueba con Strategy.')
    expect(screen.queryByRole('button', { name: /pista/ })).toBeNull()
  })
})

describe('predicciones', () => {
  it('al enchufar pregunta primero y, tras la corrida, dice si acertó', () => {
    const s = session('L01-strategy')
    render(<StageCard session={s} onNext={() => {}} />)
    runOut(s)
    act(() => void s.plug('observer'))
    expect(screen.getByRole('status').textContent).toContain('¿qué hará Observer')
    fireEvent.click(screen.getByRole('button', { name: 'No encaja aquí' }))
    runOut(s)
    expect(screen.getByRole('status').textContent).toContain('Acertaste')
  })
})

describe('CodePanel', () => {
  it('en la comparación ofrece ver los cambios del código', () => {
    const s = session('L01-strategy')
    render(<CodePanel session={s} />)
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
  it('vacío invita a probar patrones; Escape cierra', () => {
    const onClose = vi.fn()
    render(<Notebook levels={LEVELS} notes={[]} onClose={onClose} onReset={() => {}} />)
    expect(screen.getByRole('dialog').textContent).toContain('Todavía vacío')
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('agrupa las notas por patrón y borra el progreso solo si se confirma', () => {
    const onReset = vi.fn()
    render(<Notebook levels={LEVELS} notes={['L01-strategy:observer', 'L10-observer:observer']} onClose={() => {}} onReset={onReset} />)
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('2 notas de campo')
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(1)
    expect(screen.getByRole('link', { name: /Ver fuente/ }).getAttribute('href')).toContain('Observable')
    vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true)
    fireEvent.click(screen.getByRole('button', { name: 'Borrar progreso' }))
    expect(onReset).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Borrar progreso' }))
    expect(onReset).toHaveBeenCalledOnce()
  })
})

describe('Review', () => {
  it('pregunta por un nivel completado, explica la respuesta y la anota en el progreso', () => {
    const store = new MemoryProgressStore({ ...emptyProgress(), completed: ['L01-strategy'] })
    const s = session('L00-tutorial', store)
    render(<Review session={s} levels={LEVELS} onClose={() => {}} />)
    expect(screen.getByRole('dialog').textContent).toContain('¿Efectivo o tarjeta?')
    fireEvent.click(screen.getByRole('button', { name: /^Observer/ }))
    expect(screen.getByText(/La respuesta era Strategy/)).toBeTruthy()
    expect(store.load().review['L01-strategy/metodo-de-pago']).toMatchObject({ box: 1 })
    fireEvent.click(screen.getByRole('button', { name: 'Ver resultado' }))
    expect(screen.getByRole('dialog').textContent).toContain('Acertaste 0 de 1')
  })

  it('sin niveles completados no hay nada pendiente', () => {
    render(<Review session={session('L00-tutorial')} levels={LEVELS} onClose={() => {}} />)
    expect(screen.getByRole('dialog').textContent).toContain('Nada pendiente')
  })
})

describe('atajos de teclado', () => {
  it('no se activan con modificadores ni sobre controles', () => {
    const plain = { metaKey: false, ctrlKey: false, altKey: false, target: document.body }
    expect(isShortcut(plain)).toBe(true)
    expect(isShortcut({ ...plain, metaKey: true })).toBe(false)
    expect(isShortcut({ ...plain, target: document.createElement('button') })).toBe(false)
  })
})
