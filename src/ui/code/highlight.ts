import type { HighlighterCore, ThemedToken } from 'shiki/core'
import type { CodeLang } from '../../engine'

export type Token = { content: string; color?: string }

const SHIKI_LANG: Record<CodeLang, string> = { rb: 'ruby', ts: 'typescript', py: 'python' }

let highlighter: Promise<HighlighterCore> | undefined

// Shiki is loaded on demand: the game starts without waiting for the grammars.
function load() {
  highlighter ??= Promise.all([
    import('shiki/core'),
    import('shiki/engine/javascript'),
    import('shiki/langs/ruby.mjs'),
    import('shiki/langs/typescript.mjs'),
    import('shiki/langs/python.mjs'),
    import('shiki/themes/tokyo-night.mjs'),
    import('shiki/themes/github-light.mjs'),
  ]).then(([{ createHighlighterCore }, { createJavaScriptRegexEngine }, ruby, typescript, python, dark, light]) =>
    createHighlighterCore({ themes: [dark.default, light.default], langs: [ruby.default, typescript.default, python.default], engine: createJavaScriptRegexEngine() }),
  )
  highlighter.catch(() => (highlighter = undefined)) // a network failure does not leave the panel colorless forever
  return highlighter
}

export type Mode = 'light' | 'dark'
const THEME: Record<Mode, string> = { dark: 'tokyo-night', light: 'github-light' }

// Comments carry part of each lesson; Tokyo Night's #51597d reads at 2.7:1 on the panel, this one at 5:1.
const COMMENT_COLORS: Record<Mode, Record<string, string>> = { dark: { '#51597d': '#7a83ad' }, light: {} }

export async function highlight(code: string, lang: CodeLang, mode: Mode = 'dark'): Promise<Token[][]> {
  const hl = await load()
  return hl
    .codeToTokensBase(code, { lang: SHIKI_LANG[lang], theme: THEME[mode], colorReplacements: COMMENT_COLORS[mode] })
    .map((line: ThemedToken[]) => line.map((t) => ({ content: t.content, color: t.color })))
}

export const plainTokens = (code: string): Token[][] => code.split('\n').map((l) => [{ content: l }])
