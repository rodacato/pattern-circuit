// A track is its own path: its chapters, in order, and its levels numbered from 0.
// Today there is one. A new track that can be told as a circuit (e.g. whole systems with CQRS,
// events or microservices) is just content: its chapters here and its levels in `levels/`.
// `name` and the chapter values are text keys (see `locales/` next to this file).
export type Track = { id: string; name: string; chapters: Record<string, string> }

const chapter = (id: string) => `levels.shared.chapter.${id}`

export const TRACKS: Track[] = [
  {
    id: 'patterns',
    name: 'levels.shared.track.patterns',
    chapters: Object.fromEntries(['opening', 'counter', 'bar', 'rush-hour', 'all-together', 'architecture', 'resilience', 'judgment', 'final'].map((id) => [id, chapter(id)])),
  },
]

export const CHAPTERS: Record<string, string> = Object.assign({}, ...TRACKS.map((t) => t.chapters))

export const chapterName = (id: string) => CHAPTERS[id] ?? id

export const trackOf = (chapter: string): Track | undefined => TRACKS.find((t) => chapter in t.chapters)
