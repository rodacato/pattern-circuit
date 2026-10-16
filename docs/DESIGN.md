# Pattern Circuit: design

An educational game for understanding design patterns by seeing them, not reading them. A simulated cafeteria is a circuit of nodes; a pulse (the data) travels through it; at the sockets the player plugs in a pattern and the pulse reacts.

## Decisions taken

| Topic | Decision |
|---|---|
| Language of the displayed code | **Ruby**, **TypeScript** and **Python** (the `code: { rb, ts, py }` format admits more); everything inside the snippets is English |
| Language | UI in Spanish and English; identifiers, comments and documentation in English |
| Platform | Desktop and tablet |
| Stack | React + TypeScript + Vite, **PixiJS** (game-like render), zod to validate levels, vitest |
| Progression | By chapters of the cafeteria's growth (see below) |
| Visual theme | **Neon circuit** (chosen after comparing neon vs pixel art prototypes): dark background, glowing nodes, animated light wires, pulses with trails and particles |

## Visual language

- **Pulse** = data. Shape = type (● order, ■ payment, ▲ event, ◆ command). Color = state (white ok, amber odd, red error).
- **Node** = object/component. It opens with zoom to show its inner branches.
- **Wire** = dependency. **Solid = concrete; dashed = abstract.**
- **Socket** = variation point (a hexagonal port that beats when there is a problem).
- **Cartridge** = pattern, with a family stripe: amber creational, cyan structural, violet behavioral, green architecture, magenta resilience, white principle.
- **Fixed symptoms**: branches that grow, a hot node with a queue, sparks on connections that do not fit, red wires + a "Nodes modified" counter.
- **Change ticket**: a new requirement arrives; the game compares how many existing nodes have to be opened without a pattern and with it (the engine computes it by diff).
- **Results**: `solves` / `partial` / `misfit`. Trying a wrong pattern gives a field note for the *pattern notebook*.

### Signature per pattern

| Pattern | Signature |
|---|---|
| Factory Method | A press with a mold that stamps a product node; each subclass brings its mold |
| Builder | A belt with stations; the pulse collects tokens; `build()` seals and validates |
| Singleton | A node with a padlock halo; a second attempt melts into the original; faint global wires as a cost |
| Adapter | A connector that changes the pulse's shape (■ → ●) |
| Decorator | Concentric rings that wrap the pulse, stackable |
| Proxy | A translucent twin in front of a sleeping real node; cache hits bounce back |
| Composite | A tree where leaves and branches share an outline; the result goes up adding together |
| Facade | A smooth panel over a tangle; "look behind" lifts it |
| Strategy | Interchangeable cartridges in a slot that change the internal route |
| Observer | A wave that expands toward a ring of pluggable subscribers |
| State | The node changes color and wiring; mini-map of states |
| Command | The pulse turns into a card and is queued; undo flips it and the pulse goes back |
| Chain of Resp. | A row of hands that scan and pass or absorb |
| Template Method | A fixed track with gray stations and colored slots (hooks) |
| Ports & Adapters | A hexagonal core, interchangeable adapters outside |
| Event bus | A circular line through which events travel; nobody is wired directly |
| CQRS | The circuit splits into a write path and a read path with synchronization |
| Null Object | A hollow node that accepts the call and does nothing; the pulse carries a dotted ring |
| Circuit Breaker | A visible switch over the node: closed (passes) or open (diverts to the fallback) |
| Saga | Every step carries a forward arrow; compensations carry a backward arrow |

## Architecture

Detail on layers, dependency rules and how to extend in [ARCHITECTURE.md](ARCHITECTURE.md).

```
levels/*/level.ts (data + snippets) ─► defineLevel (zod + variant validation)
                                          │
                                          ▼
engine/ (pure TS, no DOM): compile · step · Timeline · applyPatch · nodesTouched · evaluate
                                          │ snapshots + SimEvent[]
                                          ▼
session ─► neon PixiJS render + skins · code panel · HUD · progress (localStorage)
```

- `step(sim) → { sim, events }` is pure and deterministic (fixed tick). Speed = ticks per frame.
- `Timeline` keeps references to snapshots every N ticks; going back = restoring + re-simulating.
- **Closed primitives** (`source`, `sink`, `pass`, `transform`, `branch`, `slot`, `broadcast`, `guard`, `counter`, `join`, `cache`, `machine`, `buffer`, `breaker`). A pattern is a `GraphPatch` of primitives + a skin. A new level = data only.
- `nodesTouched`: an existing node counts if its definition changes, it disappears or it gains/loses an outgoing **concrete** dependency. Registering an abstract wire in a `slot` does not count.
- Code with nestable `# region: Class#method` markers (`// region:` in TypeScript, `#` again in Python); `Class#method:branch` falls back to the parent region.
- `defineLevel` walks every reachable variant (repairs × sockets × tickets) and fails if one does not compile, has no scenario or points at a code region that does not exist.

The complete schema is in [`src/engine/schema.ts`](../src/engine/schema.ts).

## Progression

| # | Chapter | Pattern | Context in the cafeteria |
|---|---|---|---|
| 0 | Opening | — | The linear circuit (tutorial) |
| 1 | The counter | Strategy | Payment methods |
| 2 | | Factory Method | Branches with different menus |
| 3 | | Builder | A made-to-measure order |
| 4 | | Singleton | Repeated tickets between registers (its cost returns in 18) |
| 5 | The bar grows | Adapter | A payment terminal from another vendor |
| 6 | | Decorator | Stackable extras (+ ticket: caramel) |
| 7 | | Composite | Combos inside combos |
| 8 | | Facade | The kitchen from the inside (+ ticket: preheat) |
| 9 | | Proxy | A remote, slow warehouse |
| 10 | Rush hour | Observer | Order ready! (+ ticket: the kitchen) |
| 11 | | State | The life of an order |
| 12 | | Chain of Responsibility | Refunds (+ ticket: supervisor) |
| 13 | | Command | I got the order wrong (cancel before preparing) |
| 14 | | Template Method | Copied recipes (+ ticket: thermal sleeve) |
| 15 | All together | Factory Method + Strategy | Branches and payments (2 sockets) |
| 16 | | Composite + Decorator | Combos with extras (2 sockets) |
| 17 | | Command + State + Observer | Live orders (3 sockets) |
| 18 | Architecture | Ports & Adapters | The same core in tests and in production |
| 19 | | Event Bus | Services that find out (+ ticket: Analytics) |
| 20 | | CQRS | A thousand screens, one counter |
| 21 | Resilience | Null Object | The customer without a card |
| 22 | | Circuit Breaker | The provider went down |
| 23 | | Saga | Charged and out of oat milk |
| 24 | Judgment: when not to | Keep it simple (vs Strategy, Factory Method) | A single payment method, no other in sight |
| 25 | | Keep it simple (vs Event Bus, Command) | A single party interested in knowing about a charge |
| 26 | The whole cafeteria | — | The final run with everything working together |

Level ids are the folder names under `src/levels/` (for example `strategy`, `branches-and-payments`, `full-cafe`); they carry no number and the position comes from `order`.

Patterns evaluated and discarded:

- **Mediator**: the bus of level 19 only distributes events; it would be Mediator if it also decided who answers.
- **Memento**: it is the piece with which Command would save the state to undo (GoF); in the game, cancelling before executing is enough.
- **Visitor and Iterator**: barely visible in a circuit of pulses.
- **Dependency Injection** (Fowler, 2004): it is the usual way to plug the adapters of Ports & Adapters, not a separate pattern in the game.
- **Repository** (Fowler, PoEAA; Evans, DDD): it appears as the persistence port of level 18.

## Families

The families of the 14 GoF patterns are the book's (creational, structural, behavioral). Null Object is *object structural* according to Woolf. Ports & Adapters, Event Bus, CQRS and Saga go as **architecture**; Circuit Breaker as **resilience** (Nygard's *stability patterns*). The "Resilience" chapter groups three patterns about what to do when something fails, although their families differ.

**Keeping it simple** is not a pattern: it is the YAGNI principle (Fowler, 2015) applied to patterns. GoF warns that a pattern should not be applied indiscriminately, because it adds indirection, and that it pays off only when the flexibility it gives is needed (ch. 1); Kerievsky proposes refactoring toward a pattern when the need appears, not before. In the "Judgment" chapter the winner is whoever solves the problem without adding pieces (the `nodes` metric).

Two variants are worth naming: the Builder of level 3 is Bloch's (*Effective Java*, item 2: many parameters and a validating `build()`), not GoF's Director; the Proxy of level 9 is a *cache proxy* (POSA 1).

## Where you've seen it

Each pattern shows a real example from the Ruby ecosystem (stdlib, Rails or a well-known gem) in the notebook and when the level is passed, with a link to the documentation or the code that shows it. The examples are in [`src/engine/seenIn.ts`](../src/engine/seenIn.ts) and were verified against those links; when the example is a variant or a relative of the pattern (STI as a parameterized factory, AASM as a declarative state machine, Rails Event Store's *process manager* as a saga), the text says so.

## Sources

The content of each level was verified against these sources and against the author's guides. The game simplifies, but it should not contradict any of them.

- Gamma, Helm, Johnson, Vlissides. *Design Patterns: Elements of Reusable Object-Oriented Software*. Addison-Wesley, 1994.
- Bloch, J. *Effective Java*, 3rd ed., item 2. Addison-Wesley, 2018.
- Buschmann et al. *Pattern-Oriented Software Architecture, Vol. 1* (Proxy). Wiley, 1996.
- Woolf, B. "Null Object", in *Pattern Languages of Program Design 3*. Addison-Wesley, 1997.
- Cockburn, A. "Hexagonal Architecture (Ports and Adapters)", 2005. <https://alistair.cockburn.us/hexagonal-architecture/>
- Fowler, M. *Patterns of Enterprise Application Architecture*. Addison-Wesley, 2002.
- Evans, E. *Domain-Driven Design*. Addison-Wesley, 2003.
- Fowler, M. "Inversion of Control Containers and the Dependency Injection pattern", 2004. <https://martinfowler.com/articles/injection.html>
- Fowler, M. "CQRS", 2011. <https://martinfowler.com/bliki/CQRS.html>
- Fowler, M. "CircuitBreaker", 2014. <https://martinfowler.com/bliki/CircuitBreaker.html>
- Fowler, M. "What do you mean by 'Event-Driven'?", 2017. <https://martinfowler.com/articles/201701-event-driven.html>
- Nygard, M. *Release It!* (Stability Patterns). Pragmatic Bookshelf, 2007; 2nd ed. 2018.
- Microsoft. "Circuit Breaker pattern", Azure Architecture Center. <https://learn.microsoft.com/azure/architecture/patterns/circuit-breaker>
- Garcia-Molina, H.; Salem, K. "Sagas". *Proc. ACM SIGMOD*, 1987.
- Richardson, C. "Pattern: Saga". <https://microservices.io/patterns/data/saga.html>
- Hohpe, G.; Woolf, B. *Enterprise Integration Patterns* (Message Bus, Publish-Subscribe Channel). Addison-Wesley, 2003.
- Fowler, M. "Yagni", 2015. <https://martinfowler.com/bliki/Yagni.html>
- Fowler, M. "Is Design Dead?", 2000, rev. 2004 (section "Patterns and XP"). <https://martinfowler.com/articles/designDead.html>
- Kerievsky, J. *Refactoring to Patterns*. Addison-Wesley, 2004 (ch. 1: over-engineering and under-engineering).
- Castillo, A. *Patrones de diseño 1001* and *Arquitecturas 1001*. <https://notdefined.dev/guias/>

### Level design example: 0–3

- **0 · Open the cafeteria**: `Customer → Take → Charge → Prepare → Hand over`, the wire to Hand over is missing. Teaches the controls, click on a node → code, wire = dependency.
- **1 · Cash or card?** (Strategy): `Charge` is an if tree; the voucher gets lost. The "pay by app" ticket opens `Charge`. Strategy: cartridges, ticket with 0 nodes touched. Observer charges 3 times; Decorator wraps but the voucher is lost all the same.
- **2 · Two branches, two menus** (Factory Method): the shared flow decides with `if` which drink to create and Mountain receives lattes. Factory Method: one subclass (mold) per branch; opening Harbor touches nothing existing. Singleton and Builder do not fit.
- **3 · A made-to-measure order** (Builder): a 9-argument constructor, crossed order, an impossible combination that blows up in the kitchen after being charged. Builder: named stations + a `build()` that rejects before charging. Factory Method loses the orders without a mold; Decorator = partial.

## Phase plan

1. **Engine** ✅: primitives, deterministic `step`, Timeline, zod, GraphPatch, `nodesTouched`, levels 0–1 as data, tests, debug view.
2. **Visual language** ✅: neon PixiJS render (glow, trails, particles, animated wires), keyboard controls, Shiki code panel that follows the pulse or the node, draggable wire to repair, step list per level, result cards. Level 0 playable from end to end.
3. **Sockets and patterns** ✅: draggable inventory, beating socket, skins per pattern, field notes and notebook, change ticket, without/with comparison, level flow as a state machine, progress in localStorage. Levels 1–3 playable.
4. **Chapters 1–3** ✅: levels 4–14 with their skins. The engine added five generic primitives (`counter`, `join`, `cache`, `machine`, `buffer`); no level needed its own logic in the engine.
5. **Combinations, architecture and resilience** ✅: levels 15–24, several sockets per circuit, code composed from fragments, `breaker` primitive, camera with zoom and pan, deploy to GitHub Pages.
6. **Polish for 1.0** ✅: playable with the keyboard only, reduced motion, accessible notebook, erasing progress, content verified against the sources, coverage with thresholds.
7. **After 1.0** ✅ in 1.1: touch and tablet, English, TypeScript, spaced review, predictions, the "Judgment" chapter. Ideas: a sandbox mode with generic templates per pattern, more programming languages.
