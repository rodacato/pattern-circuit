# Architecture

Pattern Circuit is organized in **layers with dependencies in one direction only**. Each layer has one responsibility and a rule about what it may import; [`src/architecture.test.ts`](../src/architecture.test.ts) verifies it on every `npm test`.

```
                ┌────────────┐
                │   levels   │  content: data + snippets
                └─────┬──────┘
                      │
┌──────────┐    ┌─────▼──────┐    ┌───────────┐    ┌──────────┐
│  engine  │◄───┤    game    │◄───┤  render   │◄───┤    ui    │
│  domain  │    │ application│    │ PixiJS    │    │ React    │
└──────────┘    └────────────┘    └───────────┘    └──────────┘
   pure            no DOM         humble object     composition
```

| Layer | Folder | Responsibility | May import |
|---|---|---|---|
| **i18n** | `src/i18n/` | Languages: translator, catalogs (English) and text extraction for the tests. | nothing |
| **engine** | `src/engine/` | Pure domain: level format, deterministic simulation, circuit patches, evaluation. No DOM, no React, no Pixi. | only `zod` |
| **levels** | `src/levels/` | Content. One level = a folder with `level.ts` + code snippets. | `engine` |
| **game** | `src/game/` | Application: the session (playback, focus, player decisions), the level flow and progress. No DOM, no Pixi. | `engine`, `zod` |
| **render** | `src/render/` | Draws the circuit with PixiJS and translates gestures into session calls. | `engine`, `game`, `pixi.js` |
| **ui** | `src/ui/` | React: layout, cards, controls, code panel. Mounts the render. | engine, game, render, levels, `react`, `shiki` |
| **debug** | `src/debug/` | Raw engine view (`?debug`). | `engine`, `levels`, `react` |

In addition, **outside `engine/` only `engine/index.ts` is imported**: the engine's public API (tests may also use `engine/testing.ts`). Internals can be reorganized without touching the rest. Tests may also load real levels and use `vitest`, `node:*` and Testing Library.

## engine: domain

```
engine/
  schema.ts         data contract (zod): levels, primitives, patches, metrics
  patterns.ts       pattern catalog: name, family and the idea in one sentence
  sim/              types · predicate · sim (pure step) · timeline
  circuit/          geometry · compile · patch (applyPatch, nodesTouched)
  level/            variants (buildCircuit, evaluate) · define (exhaustive validation)
  code/             regions (# region markers in the snippets)
  testing.ts        circuit builders for tests
```

- **Determinism**: `step(sim) → { sim, events }` is pure. Anything that depends on real time lives outside.
- **One primitive, one method**: `Tick.resolve` only dispatches; every primitive with state (`transform`, `counter`, `cache`, `machine`, `breaker`, `join`, `buffer`) has its own method in `sim.ts`.
- **Scoring without re-simulating**: `evaluate = simulate + score`. The session already has the finished run, so it only calls `score` with its metrics. `score` aggregates the circuit's metrics: `nodesTouched` (what a ticket touched) and `nodes` (pieces, to measure the complexity a pattern adds).
- **Closed primitives**: a pattern is never engine code, it is a `GraphPatch` of primitives. Adding a primitive is an engine change, with its test; adding a pattern or a level is not.
- **Events as a boundary**: the engine emits `SimEvent`; render and ui react to them without knowing the simulation inside.

## levels: content

- A level can have **several sockets**: the reachable variants are the Cartesian product of what can be plugged into each one, and the code is composed from `base` + one fragment per socket. Combination levels reuse the snippets of the levels where each pattern was learned.
- `defineLevel` validates the schema and **every reachable variant** (any subset of repairs × patterns × tickets): if one does not compile, has no scenario or points at a code region that does not exist, the level does not load and the test fails.
- **Code in several languages**: `code.rb` (reference) and `code.ts`, with the same keys. The TypeScript snippets live in `levels/<id>/ts/` (outside `tsc` and the project's lint: they are examples to display) and use `// region:` instead of `# region:`. `defineLevel` validates that every `codeRef` exists in every language, and `typescript.test.ts` checks the syntax with `ts.transpileModule`, just as `ruby.test.ts` does with `ruby -wc`. Everything inside the snippets (identifiers, comments, output strings) is English.
- A level has **at most one change ticket**: the flow has a single "change" stage and the schema enforces it.
- The registry (`levels/index.ts`) discovers folders with `import.meta.glob`: adding a level touches no other file. A level's id is its folder name and has no ordinal; the position comes from `order`.
- Ids are stored in the saved progress. Renamed ids are translated on load through `LEGACY_LEVEL_IDS` and `LEGACY_SOCKET_IDS` (`game/progress/progress.ts`).
- `levels/kit.ts` brings helpers (`node`, `wire`, `abstract`, `chain`, `pulse`…) to write levels with little noise.
- Every level has its `level.test.ts` with the pedagogical behavior of each pattern ("Observer charges three times", "Strategy + app touches 0 nodes").
- `levels.test.ts` verifies in **all** levels, without writing anything extra: that without a pattern it fails, that the right pattern wins (also with its ticket), that no wrong pattern wins, that every option is in the inventory, that chapters advance in order and that every pattern of the catalog is taught in some level.

## game: application

```
game/
  session/GameSession.ts   facade used by render and ui
  playback/Playback.ts     timeline, speed, interpolation, code panel focus
  flow/levelFlow.ts        level state machine (pure reducer)
  progress/                ProgressStore port + adapters (localStorage, memory)
  events/Emitter.ts        minimal subscription for React
```

- **GameSession** coordinates; it does not draw or know React. It exposes commands (`play`, `plug`, `unplug`, `connect`, `applyTicket`, `resetProgress`…) and read-only state (`pendingSockets`, `comparisonRows`, `pluggedAt`, `outcomeOf`…). Decisions live in the pure functions of `levelFlow` and `progress`; the session only calls them.
- **Level flow** as a pure reducer `(level, state, event) → state`:
  `observe → choose → change → compare → complete`. Stages skip themselves according to the level's data (no sockets means no "choose"; no tickets means no "change"). Next to the reducer live its pure selectors: `stagesFor`, `targetSocket` (which socket a pattern goes to), `pluggedPatterns`, `pendingSockets`, `lastPluggedOption`.
- **Progress** behind a port (`ProgressStore`): the session receives the adapter through its constructor. Tests use the in-memory one; the app uses the `localStorage` one with a versioned, validated schema.

## render: presentation (humble object)

```
render/
  NeonStage.ts    per-frame loop, nodes, camera, gestures → session commands
  PulseLayer.ts   pulses: interpolated position, trails, turns, followed pulse
  SocketLayer.ts  hexagonal sockets and the plugging effect
  layout.ts       pure screen geometry (fit, zoom, hit test, interpolation) — with tests
  motion.ts       node animations without Pixi (flash, shake, appear) — with tests
  draw.ts         drawing helpers (shapes, hexagon, dashed line, texts)
  skins/          visual signature per pattern, grouped by family/chapter
  fx.ts           particles, waves and floating texts
  theme.ts        palette and typefaces
```

- What can be computed without Pixi lives in pure functions with tests (`layout.ts`: fit, zoom around the pointer, hit tests, interpolation). `NeonStage` stays as thin glue.
- **Skins**: each pattern contributes its signature (cartridges, waves, rings, molds…) by implementing the `Skin` interface. `createSkins()` returns a complete `Record<PatternId, Skin>`: a pattern without a skin does not compile.
- **Reduced motion**: with `prefers-reduced-motion` there are no particles, shakes, bounces or flowing wires; informative texts stay still.

## ui: composition

- Small components that read the session with `useSession(session, selector)`, which only re-renders when the selected value changes.
- Logic does not live in components: if a component needs to decide something, that decision goes to `game/`.
- **Accessibility as a rule**: everything can be played with the keyboard (cartridges with Enter/Space, wire with the "Connect… without dragging" button, shortcuts in `shortcuts.ts`), cards are `role="status"`, the notebook is a dialog with Escape and focus, and icon controls have an `aria-label`.
- If `localStorage` is not available, progress lives in memory during the session.

## Tests

| What | Where | Style |
|---|---|---|
| Engine | `engine/**/*.test.ts` | unit tests over minimal circuits (`engine/testing.ts`) |
| Levels | `levels/*/level.test.ts` + `levels/levels.test.ts` | behavior per pattern + invariants common to all levels |
| Application | `game/**/*.test.ts` | session, flow and progress with an in-memory adapter |
| Ruby code | `levels/ruby.test.ts` | `ruby -wc` over every file the player sees (skipped without ruby) |
| TypeScript code | `levels/typescript.test.ts` | syntax of every TS snippet and that no level is missing |
| Translations | `i18n/coverage.test.ts` | every visible text has English and keeps its holes |
| Render | `render/layout.test.ts`, `render/motion.test.ts` | pure geometry and animations |
| UI | `ui/ui.test.tsx` | components with Testing Library (jsdom) over a real session |
| Architecture | `architecture.test.ts` | dependency rules between layers |

`npm run check` runs types, lint and tests. `npm run coverage` measures coverage with thresholds (85 % lines, 75 % branches). Deliberately excluded: the content of the levels (their behavior tests cover it), Pixi drawing (humble object: what can be computed is in `layout.ts` and `motion.ts`, which are measured) and the entry points.

## Accepted technical debt

Things that are left as they are on purpose, with their reason:

- **Pixi drawing has no unit tests.** It is verified by playing and with the `?debug` view; whatever has logic was extracted to pure modules.
- **`GameApp.tsx` has no component test**: it mounts Pixi. Its pieces (shortcuts, cards, inventory, notebook) do have one.
- **The main bundle weighs ~850 kB** (PixiJS + React + levels). The Ruby grammar is loaded separately, on demand.
- **The breaker counts accumulated failures**: in the model successes do not go through it again, so it cannot reset the count. It is enough for level 22, where all the failures are consecutive.
- **The strategy level builds its nodes by hand** instead of using `kit.ts`: it was the first level and serves as an example of the long form.

## How to extend

- **New level**: folder `src/levels/<id>/` with `level.ts`, its `.rb` and `ts/` snippets and a `level.test.ts`. The common invariants are checked by themselves.
- **New pattern**: add it to `PATTERN_IDS` in `schema.ts` and to `PATTERNS` in `patterns.ts` (with its source in `docs/DESIGN.md`), its skin in `render/skins/`, and teach it in some level (the tests require it).
- **New primitive**: variant in `Behavior` (`schema.ts`), case in `sim.ts`, test in `sim/sim.test.ts`. Current primitives: `source`, `sink`, `pass`, `transform`, `branch`, `slot`, `broadcast`, `guard`, `counter`, `join`, `cache`, `machine`, `buffer`, `breaker`.

## Languages

- **Spanish is the source language**: each text is written in Spanish where it lives (levels, catalog, cards). The catalogs of other languages translate it using that text as the key, gettext style; whatever has no translation is shown in Spanish.
- `t(text)` translates; `msg('Nivel {n}', { n })` builds texts with holes (the values are also translated and may be other messages); `N('text')` marks a text for translation without changing it; a `// i18n` comment marks a map of texts.
- `engine` and `game` return Spanish texts or a `Message`; the translation happens when displaying, in `ui` (the `useT` context) and in `render` (the translator enters through `NeonStage.create` and floating texts are translated in `Effects`).
- Every level brings its own `en.ts`. `i18n/coverage.test.ts` requires a translation for every visible text (source code, pattern catalog, tracks and every level with all its variants) and that the `{x}` holes are preserved.
- The language is a browser preference (`localStorage`), separate from progress. Code snippets, ids, comments and documentation are always English.

## New tracks

A **track** (`levels/tracks.ts`) is a path of its own: a name, chapters in order and levels numbered from 0. Today there is one, "Design patterns". The tests already verify the order per track, and "next level" does not jump from one track to another.

- **What fits without touching the engine**: anything that can be told as pulses traveling through components. For example, complete systems with CQRS, events, sagas or microservices. A track like that is only content: its chapters in `tracks.ts` and its levels in `levels/`, with unique ids. If a new behavior is needed (for example, network latency between services), it is added as a primitive, with its test.
- **What does not fit**: algorithms (sorting, graphs, data structures). They need another visualization (arrays, trees, steps) and another engine, not pulses in a circuit. It would be a new layer next to `engine/`, with its own render; it is deliberately not prepared, so as not to add complexity nothing uses yet.

## Deploy

`vite.config.ts` uses `base: './'`, so the build is static and works under any subpath (`https://<user>.github.io/<repo>/`). The workflow [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) runs `npm run check` and publishes `dist/` to GitHub Pages on every push to `main`. The player's progress lives in the browser's `localStorage`.
