import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { dueItems, reviewItems } from '../game/learning/review'
import { fromHostLanguage } from '../course/codeLanguages'
import { firstUnfinished } from '../game/progress/progress'
import { GameSession } from '../game/session/GameSession'
import { chapterName, LEVELS, nextLevel, TRACKS, trackOf } from '../levels'
import { NeonStage } from '../render/NeonStage'
import { forceReducedMotion } from '../render/motion'
import { BriefCard } from './BriefCard'
import { StageCard } from './cards/StageCard'
import { CodePanel } from './CodePanel'
import { Inventory } from './Inventory'
import { Notebook } from './Notebook'
import { Review } from './Review'
import { msg } from '../i18n'
import { LOCALE_META, LOCALES, matchLocale, nextLocale } from '../i18n/registry'
import { themeVariables } from '../course/theme'
import { useCourse } from './courseContext'
import { useLocale, useT } from './i18nContext'
import { isShortcut, SHORTCUTS } from './shortcuts'
import { ModeContext } from './themeContext'
import { Transport } from './Transport'
import { useSession } from './useSession'
import './game.css'

export default function GameApp() {
  const { bridge, init, storage, hostUnavailable, flush } = useCourse()
  const [levelId, setLevelId] = useState(() => LEVELS.find((l) => l.id === init.unitId)?.id ?? firstUnfinished(LEVELS, storage.progress.load()).id)
  const [theme, setTheme] = useState(init.theme)
  const [epoch, setEpoch] = useState(0) // bumps when the host replaces the progress: the session starts again from it
  const index = LEVELS.findIndex((l) => l.id === levelId)
  const next = nextLevel(LEVELS[index])
  const session = useMemo(() => {
    void epoch // a new epoch means the host replaced the progress: start again from it
    const units = { started: (unitId: string) => bridge.emit({ type: 'unit.started', unitId }), completed: (unitId: string) => bridge.emit({ type: 'unit.completed', unitId }) }
    const s = new GameSession(LEVELS[index], storage.progress, units)
    s.codeLang = storage.codeLanguage.load() === 'ts' ? 'ts' : 'rb' // the preference outlives the level
    return s
  }, [index, bridge, storage, epoch])
  const codeLang = useSession(session, (s) => s.codeLang)
  useEffect(() => {
    storage.codeLanguage.save(codeLang)
  }, [codeLang, storage])
  const { t, locale, setLocale } = useLocale()

  // What the host can ask of the course: the language, the code language, to pause, to open a level, new progress.
  useEffect(() => {
    forceReducedMotion(init.reducedMotion === true)
    return bridge.onCommand((command) => {
      if (command.type === 'locale') {
        const match = matchLocale(command.value)
        if (match) {
          storage.locale.acknowledge(match)
          setLocale(match)
        }
      } else if (command.type === 'codeLanguage') {
        const lang = fromHostLanguage(command.value)
        if (lang) {
          storage.codeLanguage.acknowledge(lang)
          session.setCodeLang(lang)
        }
      } else if (command.type === 'visibility') {
        if (!command.visible) session.pause()
      } else if (command.type === 'navigate') {
        if (LEVELS.some((l) => l.id === command.unitId)) setLevelId(command.unitId)
      } else if (command.type === 'progress') {
        setEpoch((e) => e + 1)
      } else if (command.type === 'theme') {
        setTheme(command.theme)
      }
    })
  }, [bridge, init, session, setLocale, storage])

  useEffect(() => {
    bridge.emit({ type: 'ready' })
  }, [bridge])
  useEffect(() => {
    if (!flush) return
    window.addEventListener('pagehide', flush)
    return () => window.removeEventListener('pagehide', flush)
  }, [flush])

  const upcoming = nextLocale(locale)
  const host = useRef<HTMLDivElement>(null)
  const [stage, setStage] = useState<NeonStage>()
  const [notebookOpen, setNotebookOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const dialogOpen = notebookOpen || reviewOpen
  const progress = useSession(session, (s) => s.progress)
  const inventoryOpen = useSession(session, (s) => s.inventoryOpen)
  const closeNotebook = useCallback(() => setNotebookOpen(false), [])
  const closeReview = useCallback(() => setReviewOpen(false), [])
  const reviewable = useSession(session, (s) => reviewItems(LEVELS, s.progress.completed).length)
  const due = useSession(session, (s) => dueItems(reviewItems(LEVELS, s.progress.completed), s.progress.review, Date.now()).length)

  useEffect(() => {
    let created: NeonStage | undefined
    let cancelled = false
    NeonStage.create(host.current!, session, t).then((s) => {
      if (cancelled) return s.destroy()
      created = s
      setStage(s)
    })
    return () => {
      cancelled = true
      created?.destroy()
      setStage(undefined)
    }
  }, [session, t]) // changing language rebuilds the canvas with the new texts

  useEffect(() => {
    if (dialogOpen) return
    const onKey = (e: KeyboardEvent) => {
      const action = SHORTCUTS[e.key]
      if (!action || !isShortcut(e)) return
      e.preventDefault()
      action(session)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [session, dialogOpen])

  return (
    <ModeContext.Provider value={theme?.mode ?? 'dark'}>
      <div className={`game${init.reducedMotion ? ' reduce-motion' : ''}`} style={themeVariables(theme)}>
        <header className="topbar">
          <div className="logo">
            <span className="dot" />
            Pattern Circuit
          </div>
          <div className="topbar-actions">
            {LOCALES.length > 1 && (
              <button className="notebook-button locale" onClick={() => setLocale(upcoming)} aria-label={t('ui.header.language')} lang={upcoming}>
                {LOCALE_META[upcoming]?.short}
              </button>
            )}
            {reviewable > 0 && (
              <button className="notebook-button" onClick={() => setReviewOpen(true)} aria-haspopup="dialog" title={t('ui.header.reviewHint')}>
                🧠 {t('ui.header.review')} <span aria-label={t(msg('ui.header.reviewDue', { n: due }))}>{due}</span>
              </button>
            )}
            <button className="notebook-button" onClick={() => setNotebookOpen(true)} aria-haspopup="dialog">
              📓 {t('ui.header.notebook')} <span aria-label={t(msg('ui.header.notes', { n: progress.notes.length }))}>{progress.notes.length}</span>
            </button>
            <select value={levelId} onChange={(e) => setLevelId(e.target.value)} aria-label={t('ui.header.level')}>
              {[...new Set(LEVELS.map((l) => l.chapter))].map((chapter) => (
                <optgroup key={chapter} label={TRACKS.length > 1 ? `${t(trackOf(chapter)?.name ?? '')} · ${t(chapterName(chapter))}` : t(chapterName(chapter))}>
                  {LEVELS.filter((l) => l.chapter === chapter).map((l) => (
                    <option key={l.id} value={l.id}>
                      {progress.completed.includes(l.id) ? '✓ ' : ''}
                      {l.order}. {t(l.title)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </header>

        {hostUnavailable && (
          <p className="host-notice" role="status">
            {t('ui.host.unavailable')}
          </p>
        )}
        <main>
          <section className={`stage-wrap${inventoryOpen ? ' inventory-open' : ''}`}>
            <div className="stage" ref={host} role="img" aria-label={t(msg('ui.stage.circuit', { n: session.level.order, title: session.level.title }))} />
            <BriefCard key={session.level.id} session={session} />
            <StageCard key={`card-${session.level.id}`} session={session} onNext={next ? () => setLevelId(next.id) : undefined} />
            <Inventory session={session} stage={stage} />
            <Legend />
            <Transport session={session} />
          </section>
          <CodePanel key={session.level.id} session={session} />
        </main>

        {notebookOpen && <Notebook levels={LEVELS} notes={progress.notes} predictions={progress.predictions} onReset={() => session.resetProgress()} onClose={closeNotebook} />}
        {reviewOpen && <Review session={session} levels={LEVELS} onClose={closeReview} />}
        <p className="desktop-only">{t('ui.app.desktopOnly')}</p>
      </div>
      </ModeContext.Provider>
    )
  }

  function Legend() {
    const t = useT()
    return (
      <div className="legend">
        <span>
          <i className="pulse" /> {t('ui.legend.order')}
        </span>
        <span>
          <i className="solid" /> {t('ui.legend.concrete')}
        </span>
        <span>
          <i className="dashed" /> {t('ui.legend.interface')}
        </span>
        <span className="camera mouse">{t('ui.legend.cameraMouse')}</span>
        <span className="camera touch">{t('ui.legend.cameraTouch')}</span>
      </div>
  )
}
