import { beforeAll, describe, expect, it } from 'vitest'
import { CODE_LANGS, type CodeLang } from '../engine'
import { LEVELS } from '.'
import { displayedCode } from './verification/displayed'
import { hasPython, hasRuby, runPython, runRuby, runTypeScript, type Run } from './verification/verification.testing'

// The code the player sees has to run, not only parse: every file a variant can show is executed with the outside
// world stubbed, and the two languages must print the same. (A snippet is a teaching excerpt, so most only build
// their objects; the point is that nothing in them is misspelled or missing.)
const ruby = new Map<string, Run>()
const typescript = new Map<string, Run>()
const python = new Map<string, Run>()

// The two requests the builder level animates: a latte that goes through, and a hot iced drink rejected at build.
const BUILDER_DRIVER = {
  rb: `
Order = Struct.new(:size, :milk, :syrup, :shots, :temp, :ice, keyword_init: true) do
  def name = "#{size} #{milk}"
  def total = 0
  def hot? = temp == :hot
  def ice? = !!ice
end
Request = Struct.new(:size, :milk, :syrup, :shots, :hot, :iced, keyword_init: true)
counter = Counter.new
taker = OrderTaker.new(Cashier.new(Barista.new(counter)), counter)
taker.take(Request.new(size: :large, milk: :oat, syrup: :vanilla, shots: 2, hot: true))
taker.take(Request.new(size: :medium, shots: 1, hot: true, iced: true))`,
  ts: `
class Order {
  constructor(private o: any) {}
  get name() { return \`\${this.o.size} \${this.o.milk}\` }
  get total() { return 0 }
  isHot() { return this.o.temp === 'hot' }
  isIced() { return !!this.o.ice }
}
const counter = new Counter()
const taker = new OrderTaker(new Cashier(new Barista(counter)), counter)
taker.take({ size: 'large', milk: 'oat', syrup: 'vanilla', shots: 2, hot: true })
taker.take({ size: 'medium', shots: 1, hot: true, iced: true })`,
  py: `
from types import SimpleNamespace

class Order:
    total = 0

    def __init__(self, **o):
        self.o = o

    @property
    def name(self):
        return f"{self.o['size']} {self.o['milk']}"

    def is_hot(self):
        return self.o["temp"] == "hot"

    def is_iced(self):
        return bool(self.o["ice"])

def request(size, milk=None, syrup=None, shots=None, hot=False, iced=False):
    return SimpleNamespace(size=size, milk=milk, syrup=syrup, shots=shots, hot=hot, iced=iced)

counter = Counter()
taker = OrderTaker(Cashier(Barista(counter)), counter)
taker.take(request("large", milk="oat", syrup="vanilla", shots=2, hot=True))
taker.take(request("medium", shots=1, hot=True, iced=True))`,
}

describe('toolchain', () => {
  it.skipIf(!process.env.CI)('CI has Ruby, in the version the hub runs (3.0)', () => {
    expect(hasRuby).toBe(true)
    expect(runRuby('print RUBY_VERSION')).toEqual({ ok: true, stdout: expect.stringMatching(/^3\.0\./) })
  })

  it.skipIf(!process.env.CI)('CI has Python, in the version the hub runs (3.10)', () => {
    expect(hasPython).toBe(true)
    expect(runPython('import sys; print(sys.version_info[:2] == (3, 10))')).toEqual({ ok: true, stdout: 'True' })
  })
})

describe.skipIf(!hasRuby || !hasPython)('the code players can see runs', () => {
  beforeAll(() => {
    for (const level of LEVELS) {
      for (const s of displayedCode(level, 'rb')) ruby.set(s.id, runRuby(s.text))
      for (const s of displayedCode(level, 'ts')) typescript.set(s.id, runTypeScript(s.text))
      for (const s of displayedCode(level, 'py')) python.set(s.id, runPython(s.text))
    }
  }, 120_000)

  const failed = (runs: Map<string, Run>) => [...runs].flatMap(([id, run]) => (run.ok ? [] : [`${id}: ${run.error}`]))

  it('every Ruby file runs', () => {
    expect(failed(ruby)).toEqual([])
  })

  it('every TypeScript file runs', () => {
    expect(failed(typescript)).toEqual([])
  })

  it('Ruby and TypeScript print the same', () => {
    const different = [...ruby].flatMap(([id, r]) => {
      const t = typescript.get(id)
      return r.ok && t?.ok && r.stdout !== t.stdout ? [`${id}: ${JSON.stringify(r.stdout)} vs ${JSON.stringify(t.stdout)}`] : []
    })
    expect(different).toEqual([])
  })

  describe.each(LEVELS.map((l) => [l.id, l] as const))('%s in Python', (_id, level) => {
    const keys = (lang: CodeLang) => displayedCode(level, lang).map((s) => s.id)

    it('is shown wherever Ruby is', () => {
      expect(keys('py')).toEqual(keys('rb'))
    })

    it('runs and prints what Ruby prints', () => {
      const wrong = keys('py').flatMap((id) => {
        const [p, r] = [python.get(id), ruby.get(id)]
        if (!p?.ok) return [`${id}: ${p?.error ?? 'did not run'}`]
        return r?.ok && r.stdout !== p.stdout ? [`${id}: ${JSON.stringify(r.stdout)} vs ${JSON.stringify(p.stdout)}`] : []
      })
      expect(wrong).toEqual([])
    })
  })

  it('the tutorial prints what its circuit shows once the wire is repaired', () => {
    const expected = 'Charged: espresso\nPreparing espresso...\nespresso ready!'
    expect(ruby.get('tutorial/repaired')).toEqual({ ok: true, stdout: expected })
    expect(typescript.get('tutorial/repaired')).toEqual({ ok: true, stdout: expected })
    expect(python.get('tutorial/repaired')).toEqual({ ok: true, stdout: expected })
  })

  it('the builder builds the order it is given and turns the impossible one away before charging', () => {
    const level = LEVELS.find((l) => l.id === 'builder')!
    const shown = (lang: CodeLang) => displayedCode(level, lang).find((s) => s.key === 'builder')!.text
    const expected = { ok: true, stdout: 'large oat ready!\nBefore charging: hot and iced is not possible' }
    expect(runRuby(`${shown('rb')}\n${BUILDER_DRIVER.rb}`)).toEqual(expected)
    expect(runTypeScript(`${shown('ts')}\n${BUILDER_DRIVER.ts}`)).toEqual(expected)
    expect(runPython(`${shown('py')}\n${BUILDER_DRIVER.py}`)).toEqual(expected)
  })

  it('every level shows code in every language', () => {
    expect(LEVELS.filter((l) => CODE_LANGS.some((lang) => !displayedCode(l, lang).length)).map((l) => l.id)).toEqual([])
  })
})
