import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CodeLang } from '../engine'
import { dueItems, reviewItems } from '../game/learning/review'
import { firstUnfinished, KeyValueProgressStore, MemoryProgressStore, type ProgressStore } from '../game/progress/progress'
import { GameSession } from '../game/session/GameSession'
import { chapterName, LEVELS, nextLevel, TRACKS, trackOf } from '../levels'
import { NeonStage } from '../render/NeonStage'
import { BriefCard } from './BriefCard'
import { StageCard } from './cards/StageCard'
import { CodePanel } from './CodePanel'
import { Inventory } from './Inventory'
import { Notebook } from './Notebook'
import { Review } from './Review'
import { msg } from '../i18n'
import { useLocale, useT } from './i18nContext'
import { isShortcut, SHORTCUTS } from './shortcuts'
import { Transport } from './Transport'
import { useSession } from './useSession'
import './game.css'

// Con el almacenamiento bloqueado (modo privado estricto, cookies desactivadas) el juego sigue, sin guardar.
function browserProgressStore(): ProgressStore {
  try {
    return new KeyValueProgressStore(window.localStorage)
  } catch {
    return new MemoryProgressStore()
  }
}

const progressStore = browserProgressStore()

// El lenguaje del código es una preferencia de este navegador, como el idioma.
const CODE_LANG_KEY = 'pattern-circuit:code'
const storedCodeLang = (): CodeLang => {
  try {
    return window.localStorage.getItem(CODE_LANG_KEY) === 'ts' ? 'ts' : 'rb'
  } catch {
    return 'rb'
  }
}

export default function GameApp() {
  const [levelId, setLevelId] = useState(() => firstUnfinished(LEVELS, progressStore.load()).id)
  const index = LEVELS.findIndex((l) => l.id === levelId)
  const next = nextLevel(LEVELS[index])
  const session = useMemo(() => {
    const s = new GameSession(LEVELS[index], progressStore)
    s.codeLang = storedCodeLang()
    return s
  }, [index])
  const codeLang = useSession(session, (s) => s.codeLang)
  useEffect(() => {
    try {
      window.localStorage.setItem(CODE_LANG_KEY, codeLang)
    } catch {
      // sin almacenamiento, la preferencia dura esta sesión
    }
  }, [codeLang])
  const { t, locale, setLocale } = useLocale()
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
  }, [session, t]) // cambiar de idioma rehace el canvas con los textos nuevos

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
    <div className="game">
      <header className="topbar">
        <div className="logo">
          <span className="dot" />
          Pattern Circuit
        </div>
        <div className="topbar-actions">
          <button className="notebook-button locale" onClick={() => setLocale(locale === 'es' ? 'en' : 'es')} aria-label={t('Cambiar idioma')} lang={locale === 'es' ? 'en' : 'es'}>
            {locale === 'es' ? 'EN' : 'ES'}
          </button>
          {reviewable > 0 && (
            <button className="notebook-button" onClick={() => setReviewOpen(true)} aria-haspopup="dialog" title={t('Repasa problemas de niveles ya completados')}>
              🧠 {t('Repasar')} <span aria-label={t(msg('{n} pendientes', { n: due }))}>{due}</span>
            </button>
          )}
          <button className="notebook-button" onClick={() => setNotebookOpen(true)} aria-haspopup="dialog">
            📓 {t('Cuaderno')} <span aria-label={t(msg('{n} notas', { n: progress.notes.length }))}>{progress.notes.length}</span>
          </button>
          <select value={levelId} onChange={(e) => setLevelId(e.target.value)} aria-label={t('Nivel')}>
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

      <main>
        <section className={`stage-wrap${inventoryOpen ? ' inventory-open' : ''}`}>
          <div className="stage" ref={host} role="img" aria-label={t(msg('Circuito del nivel {n}: {title}', { n: session.level.order, title: session.level.title }))} />
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
      <p className="desktop-only">{t('Pattern Circuit necesita una pantalla más ancha: ábrelo en una tablet, una computadora o gira el teléfono.')}</p>
    </div>
  )
}

function Legend() {
  const t = useT()
  return (
    <div className="legend">
      <span>
        <i className="pulse" /> {t('pedido')}
      </span>
      <span>
        <i className="solid" /> {t('depende de una clase concreta')}
      </span>
      <span>
        <i className="dashed" /> {t('depende de una interfaz')}
      </span>
      <span className="camera mouse">{t('rueda: zoom · arrastrar el fondo: mover · doble clic: encuadrar · espacio, ←, →, R: reproducción')}</span>
      <span className="camera touch">{t('pellizca: zoom · arrastra el fondo: mover · doble toque: encuadrar')}</span>
    </div>
  )
}
