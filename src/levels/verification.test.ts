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

type SolvedDriver = { level: string; key: string; expected: string; driver: Partial<Record<CodeLang, string>> }

// Running a file only builds its objects, so a method body can be wrong and still run: these call the solution the
// way its circuit does. TypeScript's private constructor is only a type check, so Singleton has no TS driver.
const SOLVED_DRIVERS: SolvedDriver[] = [
  {
    level: 'singleton',
    key: 'singleton',
    expected: 'one counter',
    driver: {
      rb: `
second = begin
  TicketCounter.new
rescue NoMethodError
  TicketCounter.instance
end
puts second.equal?(TicketCounter.instance) ? "one counter" : "two counters"`,
      py: `
print("one counter" if TicketCounter() is TicketCounter.instance() else "two counters")`,
    },
  },
  {
    level: 'combos-with-extras',
    key: 'base+combo_composite+extras_decorator',
    expected: 'latte: oat shot',
    driver: {
      rb: `
class Latte < Product
  def extras = @extras ||= []
end
parts = CoffeeMenu.new.drink_for([:oat, :shot]).make
puts "latte: #{parts.last.extras.join(" ")}"`,
      ts: `
class Latte extends Product { extras: string[] = [] }
const parts = new CoffeeMenu().drinkFor(['oat', 'shot']).make() as Latte[]
console.log(\`latte: \${parts[parts.length - 1].extras.join(' ')}\`)`,
      py: `
class Latte(Product):
    def __init__(self):
        self.extras = []

parts = CoffeeMenu().drink_for(["oat", "shot"]).make()
print("latte: " + " ".join(parts[-1].extras))`,
    },
  },
  {
    level: 'null-object',
    key: 'null_object',
    expected: 'Card: no card\nReady!',
    driver: {
      rb: `
order = Struct.new(:card, :total).new(LoyaltyCards.new.find(Struct.new(:id).new("ana")), 5)
Loyalty.new.reward(order)
Discounts.new.apply(order)
Receipt.new.print(order)
Counter.new.hand_over(order)`,
      ts: `
const order = { card: new LoyaltyCards().find({ id: 'ana' }), total: 5 }
new Loyalty().reward(order)
new Discounts().apply(order)
new Receipt().print(order)
new Counter().handOver(order)`,
      py: `
from types import SimpleNamespace

order = SimpleNamespace(card=LoyaltyCards().find(SimpleNamespace(id="ana")), total=5)
Loyalty().reward(order)
Discounts().apply(order)
Receipt().print(order)
Counter().hand_over(order)`,
    },
  },
  {
    level: 'saga',
    key: 'saga',
    expected: 'Charged 5\nReady!\nCharged 6\nRefunded 6\nLuis: No supplies left: we refunded your money',
    driver: {
      rb: `
class OutOfStock < StandardError; end
module Gateway
  def self.charge(total) = puts("Charged #{total}")
  def self.refund(total) = puts("Refunded #{total}")
end
module Stock
  def self.available?(items) = !items.include?(:oat)
  def self.release(items) = nil
end
Order = Struct.new(:customer, :total, :items)
PlaceOrderSaga.new.call(Order.new("Ana", 5, [:espresso]))
PlaceOrderSaga.new.call(Order.new("Luis", 6, [:oat]))`,
      ts: `
class OutOfStock extends Error {}
const Gateway = { charge: (total: number) => console.log(\`Charged \${total}\`), refund: (total: number) => console.log(\`Refunded \${total}\`) }
const Stock = { isAvailable: (items: string[]) => !items.includes('oat'), release: (_items: string[]) => {} }
new PlaceOrderSaga().call({ customer: 'Ana', total: 5, items: ['espresso'] })
new PlaceOrderSaga().call({ customer: 'Luis', total: 6, items: ['oat'] })`,
      py: `
from types import SimpleNamespace

class OutOfStock(Exception):
    pass

class Gateway:
    @staticmethod
    def charge(total):
        print(f"Charged {total}")

    @staticmethod
    def refund(total):
        print(f"Refunded {total}")

class Stock:
    @staticmethod
    def is_available(items):
        return "oat" not in items

    @staticmethod
    def release(items):
        pass

PlaceOrderSaga().call(SimpleNamespace(customer="Ana", total=5, items=["espresso"]))
PlaceOrderSaga().call(SimpleNamespace(customer="Luis", total=6, items=["oat"]))`,
    },
  },
]

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

  it.each(SOLVED_DRIVERS)('$level/$key does what its circuit shows', ({ level, key, expected, driver }) => {
    const snippet = (lang: CodeLang) => displayedCode(LEVELS.find((l) => l.id === level)!, lang).find((s) => s.key === key)!.text
    const run = { rb: runRuby, ts: runTypeScript, py: runPython }
    const wrong = CODE_LANGS.flatMap((lang) => {
      const code = driver[lang]
      if (!code) return []
      const result = run[lang](`${snippet(lang)}\n${code}`)
      return result.ok && result.stdout === expected ? [] : [`${lang}: ${JSON.stringify(result)}`]
    })
    expect(wrong).toEqual([])
  })

  it('every level shows code in every language', () => {
    expect(LEVELS.filter((l) => CODE_LANGS.some((lang) => !displayedCode(l, lang).length)).map((l) => l.id)).toEqual([])
  })
})
