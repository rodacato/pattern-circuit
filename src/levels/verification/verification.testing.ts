import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

export type Run = { ok: true; stdout: string } | { ok: false; error: string }

const RUBY_PRELUDE = readFileSync('src/levels/verification/prelude.rb', 'utf8')
const TS_PRELUDE = readFileSync('src/levels/verification/ts/prelude.ts', 'utf8')
const PY_PRELUDE = readFileSync('src/levels/verification/prelude.py', 'utf8')

export const hasRuby = spawnSync('ruby', ['-v']).status === 0
export const hasPython = spawnSync('python3', ['-V']).status === 0

export function runRuby(code: string): Run {
  const result = spawnSync('ruby', ['-e', `# encoding: utf-8\n${RUBY_PRELUDE}\n${code}`], { encoding: 'utf8', timeout: 10_000 })
  return result.status === 0 ? { ok: true, stdout: result.stdout.trimEnd() } : { ok: false, error: result.stderr.split('\n')[0] }
}

// TypeScript is transpiled and run in a bare context: only what the example prints is observable.
export function runTypeScript(code: string): Run {
  const js = ts.transpileModule(`${TS_PRELUDE}\n${code}`, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText
  const lines: string[] = []
  const context = vm.createContext({ console: { log: (...args: unknown[]) => lines.push(args.join(' ')) }, crypto: { randomUUID: () => 'uuid' }, process: { env: {} }, setTimeout })
  try {
    vm.runInContext(js, context, { timeout: 2000 })
    return { ok: true, stdout: lines.join('\n') }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// -I: neither the environment nor the current folder can change what runs; UTF-8 so the output does not depend on a locale.
export function runPython(code: string): Run {
  const result = spawnSync('python3', ['-I', '-c', `${PY_PRELUDE}\n${code}`], { encoding: 'utf8', timeout: 10_000, env: { ...process.env, PYTHONIOENCODING: 'utf-8' } })
  return result.status === 0 ? { ok: true, stdout: result.stdout.trimEnd() } : { ok: false, error: result.stderr.trimEnd().split('\n').pop() ?? 'failed' }
}
