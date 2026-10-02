import type { HighlighterCore, ThemedToken } from 'shiki/core'
import type { CodeLang } from '../../engine'

export type Token = { content: string; color?: string }

const SHIKI_LANG: Record<CodeLang, string> = { rb: 'ruby', ts: 'typescript' }

let highlighter: Promise<HighlighterCore> | undefined

// Shiki is loaded on demand: the game starts without waiting for the grammars.
function load() {
  highlighter ??= Promise.all([
    import('shiki/core'),
    import('shiki/engine/javascript'),
    import('shiki/langs/ruby.mjs'),
    import('shiki/langs/typescript.mjs'),
    import('shiki/themes/tokyo-night.mjs'),
  ]).then(([{ createHighlighterCore }, { createJavaScriptRegexEngine }, ruby, typescript, theme]) =>
    createHighlighterCore({ themes: [theme.default], langs: [ruby.default, typescript.default], engine: createJavaScriptRegexEngine() }),
  )
  highlighter.catch(() => (highlighter = undefined)) // a network failure does not leave the panel colorless forever
  return highlighter
}

export async function highlight(code: string, lang: CodeLang): Promise<Token[][]> {
  const hl = await load()
  return hl
    .codeToTokensBase(code, { lang: SHIKI_LANG[lang], theme: 'tokyo-night' })
    .map((line: ThemedToken[]) => line.map((t) => ({ content: t.content, color: t.color })))
}

export const plainTokens = (code: string): Token[][] => code.split('\n').map((l) => [{ content: l }])
