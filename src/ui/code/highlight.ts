import type { HighlighterCore, ThemedToken } from 'shiki/core'

export type Token = { content: string; color?: string }

let highlighter: Promise<HighlighterCore> | undefined

// Shiki se carga bajo demanda: el juego arranca sin esperar la gramática de Ruby.
function load() {
  highlighter ??= Promise.all([
    import('shiki/core'),
    import('shiki/engine/javascript'),
    import('shiki/langs/ruby.mjs'),
    import('shiki/themes/tokyo-night.mjs'),
  ]).then(([{ createHighlighterCore }, { createJavaScriptRegexEngine }, ruby, theme]) =>
    createHighlighterCore({ themes: [theme.default], langs: [ruby.default], engine: createJavaScriptRegexEngine() }),
  )
  highlighter.catch(() => (highlighter = undefined)) // un fallo de red no deja el panel sin color para siempre
  return highlighter
}

export async function highlightRuby(code: string): Promise<Token[][]> {
  const hl = await load()
  return hl
    .codeToTokensBase(code, { lang: 'ruby', theme: 'tokyo-night' })
    .map((line: ThemedToken[]) => line.map((t) => ({ content: t.content, color: t.color })))
}

export const plainTokens = (code: string): Token[][] => code.split('\n').map((l) => [{ content: l }])
