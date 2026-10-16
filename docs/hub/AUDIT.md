# Pattern Circuit audit against the hub criteria

> Draft for review. Audited state: `main` at `fd7cb77` (v1.1.0). Baseline: `npm run check` is green (53 files, 1018 tests); the latest GitHub CI run also passed and includes the 174 Ruby tests.
> Paths are relative to the repo root; `file:line` points at what was verified during this read. Where the hub's second course (Domain Wall, `learning/ddd`) already made a convention decision, it is noted as "DW".

## Summary

| # | Criterion | Status | Effort to comply |
|---|---|---|---|
| 1 | Code in English | **Partial** | M |
| 2 | Translations | **Partial** (result good, mechanism not) | L |
| 3 | Readability and intent | **Partial** (good base) | S–M |
| 4 | Extensibility through data | **Partial**: level ✔, pattern ◐, programming language ◐, human language ✘ | M |
| 5 | Animation ↔ code link | **Complies** | S (minor improvements) |
| 6 | Programming languages | **Partial**: Ruby ✔, TypeScript ✔, Python ✘ | L |
| 7 | Embeddability | **Partial** | M |
| 8 | Visual coherence with the host | **Partial** (seams exist, API missing) | M |
| 9 | Verification | **Partial** (syntax only) | M–L |

What already works in the hub's favor and should not be touched: deterministic engine with no DOM, levels as validated data, named code regions, the `ProgressStore` port, a static build with `base: './'`, layer rules enforced by a test, `prefers-reduced-motion`, a game fully playable by keyboard and touch.

---

## 1. Code in English — Partial

**Complies**
- Application identifiers are in English (`GameSession`, `reduceFlow`, `nodesTouched`, `ProgressStore`…).
- `CONTRIBUTING.md:33` requires English identifiers.

**Does not comply**
- **Spanish ids in data** (identifiers, even if they live in data): ~80 distinct node ids (`cliente`, `tomar`, `cobrar`, `preparar`, `entregar`, `cocina`, `bandeja`, `pagoEfectivo`… in `src/levels/*/level.ts`), socket ids (`metodo-de-pago`, `dependencias`), repair/ticket/scenario ids (`conectar-entrega`, `pago-app`, `con-app`, `con-caramelo`, `con-supervisor`, `crear-bebida`…), chapter ids (`mostrador`, `barra`, `hora-pico`, `todo-junto`: `src/levels/tracks.ts:11-19`) and pulse tags (`montana`, `puerto`, `args-cruzados`, `hielo`: `src/render/theme.ts:22-35`).
- **Folder and file names**: `L15-sucursales-y-pagos`, `L16-combos-con-extras`, `L17-pedidos-en-vivo`, `L24-un-solo-pago`, `L25-un-solo-oyente`, `L26-cafeteria-completa`; 24 snippet files with Spanish names (`base_puerto.rb`, `*_caramelo`, `*_cocina`, `*_supervisor`, `*_manga`, `*_precalentar`, in `.rb` and `ts/`).
- **Mixed-language class names inside the code the player sees**: `LatteConAvena`, `LatteConAvenaYShot`, `LatteConCaramelo`, `CentroBranch`, `PlayaBranch`, `MontanaBranch`, `PuertoBranch`, `Lealtad`.
- **Comments**: Spanish in engine/game/UI source (for example `src/engine/schema.ts:1-4`, `:15`, `:58`), and in 109 of the 138 `.rb` and 109 of the 138 `ts/` snippets (at least: counted by accented characters, so unaccented comments are not included). Snippet output strings too (`puts "Cobrado: …"` in `src/levels/L00-tutorial/base.rb:18`, the `console.log` equivalent in `ts/base.ts:19`).
- **Commit messages**: Spanish by rule (`CONTRIBUTING.md:20`; all 82 commits except the type prefix).
- **Documentation**: README, CONTRIBUTING and `docs/` in Spanish (`CONTRIBUTING.md:33`: "comments, UI texts and documentation in Spanish").

**Risk note:** level ids are persisted progress keys (`src/game/progress/progress.ts:63` already had to migrate `L24` → `L26`). Renaming folders needs a migration table; the mechanism (`migrateLevelIds`) already exists.

## 2. Translations — Partial

| Sub-criterion | Status | Evidence |
|---|---|---|
| Every visible text has a translation and is validated | Complies (English only) | `src/i18n/coverage.test.ts:15-37` requires English for UI, render, patterns, families, tracks and every level with all its variants, and that `{x}` holes are preserved. |
| No visible strings in components/render/levels | **Does not comply** | Spanish is the source language *and the key*: `t('Cuaderno')` (`src/ui/GameApp.tsx:112-116`), level texts in `level.ts` (for example `L01-strategy/level.ts:52-56`), pattern catalog in `src/engine/patterns.ts:15-35`, examples in `src/engine/seenIn.ts`, hints in `src/game/learning/hints.ts` (`// i18n` maps). Spanish has no catalog file: `CATALOGS = { es: {}, … }` (`src/ui/I18nProvider.tsx:8`). |
| Add a language without touching code | **Does not comply** | Requires editing `LOCALES` and `detectLocale` (`src/i18n/index.ts:4,34-37`), `CATALOGS` (`I18nProvider.tsx:8`), `LEVEL_CATALOGS = { en }` and the `./*/en.ts` glob (`src/levels/index.ts:21-22`), the button that toggles ES↔EN (`GameApp.tsx:107-108`) and `index.html` (fixed `lang="es"`, Spanish-only description). |
| Missing-key validation | Partial | Only against `en`. Extraction is a regex over literals inside `t()`, `msg()`, `N()`, `.float()` and `// i18n` maps (`src/i18n/texts.ts:3-6`): a text assembled any other way is not detected. |

**Other findings**
- Snippet comments and outputs are not translated (CHANGELOG 1.1.0: "code comments are still in Spanish"). With the UI in English the player sees Spanish comments.
- `seenIn` ("Where you've seen it") is tied to Ruby/Rails: the fixed text "En Ruby: …" (`src/ui/SeenIn.tsx:11`) and the content of `src/engine/seenIn.ts` appear even when the player is viewing TypeScript. It is both a content problem and a model problem (it should be per programming language).
- `index.html:7` says "25 niveles, código en Ruby": stale (27 levels, Ruby and TypeScript).
- Size of an id-based migration: ~270 UI/game/pattern keys (`src/i18n/en/*`) + ~685 level texts (`src/levels/*/en.ts`) ≈ **950 strings**, 72 `t('…')` call sites in ui/render/game and 3,642 lines of `level.ts`.
- **DW convention to follow (same conventions):** a `LocaleRegistry` as the single source of truth for locales; typed keys derived from the source catalog (a missing key does not compile); `module.concept.element` key naming; parity checks in CI (keys, ICU variables, "text equal to source" warning); an `i18n:scaffold <locale>` script; progress independent of language; code always in English; locale tags such as `es-MX` and `en`, with `negotiateLocale`. Pattern Circuit currently has none of these.

## 3. Readability and intent — Partial (good base)

**Complies**
- Explicit state types: `Stage`, `Side`, `FlowEvent` (`src/game/flow/levelFlow.ts:5-33`), `CodeLang`, `PatternFamily`, `outcome: 'solves'|'partial'|'misfit'`, `dep: 'concrete'|'abstract'`.
- A single source of types: the zod schema (`src/engine/schema.ts:1-2`, inferred types at `:225-244`).
- Pure reducers and selectors; `GameSession` as a facade; humble-object render; layer rules verified by a test.
- Comments are mostly "why".

**Could improve**
- **Ids as free `string`s**: node/socket/region ids (`codeRef: string`, `schema.ts:113`), pulse tags (`hasTag: string`). There are no branded types (`NodeId`, `RegionName`); a typo is caught in `defineLevel` (at load/test time), not at compile time. (DW uses branded types with smart constructors.)
- **Loose booleans for state**: `FlowState.solved`, `ticketApplied`, `ticketDone` live next to `stage` (`levelFlow.ts:12-19`); several combinations are impossible. A discriminated union candidate.
- **Texts as keys** (§2): the key is prose, so editing the Spanish wording silently breaks the translation until the test reports it.
- **Long files**: `NeonStage.ts` 422 lines, `GameSession.ts` 382, `sim.ts` 394 (documented debt; `sim.ts` is already split per primitive).
- Some **"what" comments** exist (for example file headers in `patterns.ts`), and they are in Spanish (§1).

## 4. Extensibility through data

| What is added | Status | What has to be touched today |
|---|---|---|
| **Level** | **Complies** | Only a folder: registry via `import.meta.glob` (`src/levels/index.ts:6`), validation of every variant (`src/engine/level/define.ts:59-82`), automatic invariants (`src/levels/levels.test.ts`). |
| **Pattern** | Partial | By design it is code: `PATTERN_IDS` (`schema.ts:9-16`), `CATALOG` (`patterns.ts:14`), a skin in `render/skins/*` (the type requires it), `seenIn.ts`, family color (`render/theme.ts:46`), the English translation and a level that teaches it. The engine does not change. |
| **Programming language** | Partial | The engine is almost generic (`CODE_LANGS`, `define.ts:34-47`), but: `CODE_LANGS = ['rb','ts']` (`schema.ts:5`) and `code: z.object({ rb, ts? })` with fixed keys (`:222`); Ruby is privileged (`define.ts:47` uses the `rb` keys as the truth; `GameSession.ts:93` falls back to `'rb'`); `GameApp.tsx:36` (`=== 'ts' ? 'ts' : 'rb'`); `CodePanel.tsx:107` assumes two languages (`lang === 'rb' ? … : …`) and `:131` (`LANG_NAME`); Shiki (`src/ui/code/highlight.ts:6-19`); per-language tests; snippets per level. |
| **Human language** | **Does not comply** | See §2. |

The engine and render need no change for a new level or a new programming language: what is missing is un-hardcoding the `rb`/`ts` pair and the `es`/`en` pair.

## 5. Animation ↔ code link — Complies

- Nodes and pulses point at **named regions**, not line numbers: `codeRef` on the node (`schema.ts:113`); the simulator emits `pulse.enter`/`pulse.branch` with `codeRef` (`src/engine/sim/sim.ts:165`, `:368`; `src/engine/sim/types.ts:29-30`).
- Nestable `# region: Class#method` / `// region:` markers are stripped when parsing and line numbers are computed afterwards (`src/engine/code/regions.ts:6-30`); `Class#method:branch` falls back to the parent region (`:33-36`).
- `defineLevel` fails if any `codeRef` points at a non-existent region **in any variant and any language** (`define.ts:66-78`), including the `base+socketA+socketB` compositions (`define.ts:68`).
- It is robust to edits: adding or removing lines breaks nothing as long as the regions exist.
- **Where the TypeScript snippets live**: `src/levels/<id>/ts/*.ts`, 138 files. They are excluded from `tsc` (`tsconfig.app.json:27`) and from oxlint (`.oxlintrc.json`, `ignorePatterns`), imported with `?raw`, and several are concatenated (`tsBase + tsAdapter`), so they are not compilable files on their own. They are verified only with `ts.transpileModule` (syntax): `src/levels/typescript.test.ts:6-12`.

**Improvable (not blocking)**
- Region names follow Ruby's convention (`Counter#hand_over`) and are shown as-is with TypeScript too (`CodePanel.tsx:103`, while the real method is `handOver`). A language-neutral region id plus a per-language label would be better.
- Nothing checks that a region's *content* is the intended one, nor that Ruby and TypeScript tell "the same story line by line" (what `CONTRIBUTING.md:43` asks): only that the same keys exist and the referenced regions exist.

## 6. Programming languages

**Ruby (reference)**: 138 snippets; syntax checked with `ruby -wc` (`src/levels/ruby.test.ts`, skipped if Ruby is missing; it runs in CI: 174 tests).
**TypeScript**: 138 snippets, same keys and regions; syntax only, no types and no execution (§9).

**What it would take for idiomatic, verified Python**
1. Generalize the language model: a `CodeLang` id per language (`ruby`, `typescript`, `python` = Dojo/Piston ids) and a registry with label, Shiki grammar, comment marker and verifiers; remove Ruby's privileged status (the points in §4).
2. 138 Python snippets with the **same regions**, written as Python (modules, `dataclass`, `Protocol`/ABC, `typing`, `snake_case`, `with`, `__call__`), not transliterated Ruby.
3. `seenIn` per language (Django, `functools`, `logging`, `contextlib`…), verified against sources like the rest of the content (`CONTRIBUTING.md:61`).
4. Verification: `python -m py_compile`/`ast.parse` (syntax), `ruff`/`pyflakes` (names), `pyright` or `mypy` with stubs (types) and execution with golden output (§9).
5. The `#` marker is already supported by `parseCode` (`regions.ts:6-7`) and `withCommon` (`src/levels/kit.ts:38`); significant indentation does not matter because markers occupy whole lines.

**Runtime baselines (only relevant if snippets are ever run in Dojo's Piston, see Plan phase 7).** Dojo's Piston runs Ruby 3.0.1, Python 3.10/3.12 and TypeScript 5.0.3 (also DW ADR 7). In Pattern Circuit's Ruby snippets there is no `Data.define` (3.2); 102 files use endless methods, which are valid in 3.0. CI does not pin the Ruby version (it uses whatever `ubuntu-latest` ships), so "passes CI" does not yet mean "runs on 3.0.1".

## 7. Embeddability — Partial

| Aspect | Status | Evidence / risk |
|---|---|---|
| Relative paths | ✔ | `base: './'` (`vite.config.ts:8`); `dist/index.html` uses `./assets`, `./favicon.svg`. `dist/` can be hosted at any subpath. |
| No `window.top`/`window.parent` | ✔ | The search in `src/` finds nothing. |
| Responsive size | ✔/◐ | Pixi with `resizeTo: host` (`NeonStage.ts:60`), grid layout, stacks below 1000 px (`game.css:1222`). **Below 600 px of width the "desktop-only" notice covers the game** (`game.css:999-1010`): inside a narrow iframe the course becomes unusable. `height: 100vh` (`game.css:15`) works only if the host fixes the iframe height; there is no resize protocol. |
| Focus and shortcuts | ◐ | Global `window` listener for Space/←/→/R with `preventDefault` (`GameApp.tsx:87-97`) and Escape (`useDialog.ts:10`). Inside an iframe, keyboard events do not cross to the host, so they do not clash with host shortcuts; but the game does not take focus on load (a click is needed first) and `R` resets without confirmation. |
| `window.confirm` | ✘ | `Notebook.tsx:40` ("Delete all progress?"). In an iframe with `sandbox` lacking `allow-modals` it returns `false` silently: the delete button would look dead. |
| `localStorage` in an iframe | ◐ | Three keys (`pattern-circuit:progress`, `:locale`, `:code`) with `try/catch` and a memory fallback (`GameApp.tsx:22-40`, `I18nProvider.tsx:11-31`, `progress.ts:77-101`), so nothing breaks. But in a cross-origin iframe, storage is **partitioned by top-level site** in modern browsers and can be purged or capped (Safari/ITP); under `sandbox` without `allow-same-origin` it throws `SecurityError`. Design conclusion: when embedded, progress cannot depend on the course's `localStorage`; the host stores it. (Per-browser behavior is to be verified empirically in phase 3, with the test host on another origin.) |
| Reduced motion | ✔ | `prefersReducedMotion()` (`render/motion.ts:56`) and CSS `.game *` (`game.css:959-964`); the OS preference applies inside the iframe too. A host cannot force it. |
| External dependencies | ◐ | Google Fonts via `<link>` (`index.html:11-13`); the host's `font-src` does not apply (the iframe has its own document), but a self-hosted hub without internet falls back to system fonts, and Pixi uses `Inter`/`JetBrains Mono` (`render/theme.ts:18-19`). |
| No headers of its own | — | GitHub Pages cannot set `frame-ancestors`: anyone can embed the course (acceptable: it stores nothing sensitive, but the host must validate who it talks to). |
| Dojo context | — | Dojo serves `X-Frame-Options: DENY` and `frame-src 'self' https://challenges.cloudflare.com` (`apps/web/nginx.conf.template:19,28`): course origins must be added to `frame-src`. |

## 8. Visual coherence with the host — Partial

**Existing seams**
- CSS tokens on `.game` (`game.css:2-14`: `--bg --panel --panel-2 --line --text --muted --faint --cyan --violet --amber --green --red --radius`): receiving host tokens for the *chrome* (bar, panels, cards, code panel) means changing variables.
- Same typefaces as Dojo (Inter and JetBrains Mono; Dojo's `BRANDING.md`: "typography does not change between themes").

**Obstacles**
- The Pixi stage palette is module-level numeric constants (`render/theme.ts:3-16`), duplicated from the CSS and not injectable; there are ~29 more hex literals in `game.css` (for example `:37`) and `index.css` (`body { background: #0e1116 }`).
- The glow uses `blendMode = 'add'` (`NeonStage.ts:66`): it only works on a dark background. A light Dojo theme (Washi) cannot paint the stage light without losing the neon signature.
- Code highlighting is fixed to `tokyo-night` (`highlight.ts:6-19`).
- Pulse, family and state colors **mean something** (red = error, shape = type; `DESIGN.md`): a host must not be able to override them.
- Brand tension: Dojo forbids confetti and celebration and describes neon as what "would fight the content" (`BRANDING.md`). The natural answer is that the stage is "the monitor" (always dark, its own identity) and the rest adopts the host theme.

**What it would cost**: chrome tokens through CSS variables (S); a `RenderTheme` injected into `NeonStage.create` the way the translator `t` already is (the stage is already recreated when `t` changes: `GameApp.tsx:85`) (M); a mode → Shiki theme map (S); an optional light stage (L, out of scope).

## 9. Verification — Partial

**What CI covers today** (`.github/workflows/ci.yml`, `deploy.yml`): `tsc -b`, `oxlint`, `vitest` with coverage thresholds (85/85/75/85), `vite build`. In the tests: engine, levels (the `levels.test.ts` invariants for all 27: without a pattern it fails, the right one wins, no wrong one wins…), layer rules, English translation, Ruby **syntax** (`ruby -wc`, 174 tests in CI) and TypeScript **syntax** (`transpileModule`). It verifies the *assembled* code (`level.codeFiles`, including the `a+b` compositions), which is what the player sees.

**What it does not cover**
1. **TypeScript semantics**: snippets are outside `tsc` and lint; they may reference non-existent names or types without anything failing.
2. **Execution**: nothing runs the code or compares its output with what the animation shows.
3. **Cross-language parity**: only keys and referenced regions, not content or outputs.
4. **Ruby can be skipped silently** (`describe.skipIf(!hasRuby)`, `ruby.test.ts:7`); in CI it works because the runner ships Ruby, but no assertion requires it, and the version is not pinned (§6).
5. No tests of `GameApp`/Pixi (documented debt), no iframe integration test, no automated accessibility check.
6. Coverage excludes levels and render (`vite.config.ts:25-38`), which is reasonable but leaves the embed without a net.

**Proposed ladder** (each step builds on the previous): L1 syntax (today) → L2 static semantics (`tsc` with ambient *stubs* for `CardTerminal`, `Stripe`…; `ruby -wc` + a linter; `py_compile` + pyright/ruff) → L3 execution with a stub *prelude* and expected output for the `wiring` region → L4 parity: same output in all languages. DW's CI follows the same philosophy (real tools, differential test, golden snapshots), so both courses can share the approach.

---

## Content findings (reported separately; nothing is touched without your go-ahead)

I did not audit the pedagogical correctness of the 27 levels (the project already verified them against sources); these are only evident mismatches:
1. `index.html:7`: "25 niveles, código en Ruby" (today 27 levels, Ruby and TypeScript).
2. `docs/DESIGN.md:9` ("code language: Ruby") and `:167` (post-1.0 plan: more languages and touch support) were already done in 1.1.0.
3. `docs/ARCHITECTURE.md:139` still lists the Spanish code comments as pending: they still are, and it is part of §1.
4. "En Ruby: …" and the `seenIn` examples are shown with TypeScript selected (§2).
5. With the UI in English, the snippets' comments and outputs are still Spanish (§1/§2).
