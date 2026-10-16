# Alignment plan: Pattern Circuit and the hub

> Draft for approval (revision 2). Inputs: [AUDIT.md](AUDIT.md) and [ADR-course-kit.md](ADR-course-kit.md).
> Relative estimates: **S** ≈ half a day · **M** ≈ 1–2 days · **L** ≈ 3–5 days · **XL** ≈ more than a week.

## Decisions already taken

| # | Decision |
|---|---|
| 1 | **Full i18n migration** to id-based keys with pluggable locales, validated by an oracle test that proves rendered texts stay identical. |
| 2 | **Code is English everywhere**, including comments and output strings *inside the snippets the player sees*. Explanations stay localized outside the code. |
| 3 | **Level ids lose their ordinal** (`strategy`, not `L01-strategy`), with a migration of saved progress. |
| 4 | The shared contract is called **course-kit** (a working name for the contract, not a course). No decision needed unless you want another name. |
| 5 | **The host chooses the course locale** and sends a tag negotiated against the manifest's locales. Keep it as simple as possible for now: Dojo can start from `navigator.languages`; whether a user preference is needed is decided when a course is actually connected. |
| 6 | Course `state` merges as **last writer wins** at first; a course-side merge is a later, optional step. |
| 7 | Code running: only "run the code shown" through the host (a+b), and only when Dojo has `code.run`. "Write the pattern" exercises are a separate experiment. |
| 8 | **Everything in English**: documents, README (English only, not bilingual), code, commits. The game's frontend keeps supporting localization (ES/EN today), but the project itself is English. |
| 9 | The Spanish locale code in Pattern Circuit is **`es-MX`**. The rename is done beforehand with a separate prompt, outside the phases, so phase 1B starts from `es-MX`. |
| 10 | Pattern Circuit is a **static site on GitHub Pages**: no custom headers, no server. Embedding safety therefore rests on the origin handshake, not on `frame-ancestors`. |
| 11 | Scope: this plan covers **Pattern Circuit only**. Domain Wall is handled in its own project; it is referenced in the ADR only as the contract's likely second consumer. |
| 12 | **Transport: iframe + `postMessage` (option A)**, the simplest one, until something more is needed. Same-origin vendoring and in-process mounting stay documented (ADR §3.1) but are not built. |

## Status (branch `refactor/english-ids`, nothing pushed)

| Phase | State | Notes |
|---|---|---|
| 1A, 1B, 1C | done | English ids and code; keys-not-prose i18n with `es-MX` and `en` and an oracle against v1.1.0; in-dialog confirm, one ticket state |
| 2, 3 | done | manifest, typed protocol, standalone and embedded adapters, test host (`npm run host:test`) |
| 3b | **not started** | publishing the package needs your decision (npm, GitHub Packages, git dependency or a static schema site) |
| 4 | done | theme tokens validated; chrome follows the host, the stage keeps the neon identity |
| 5 | done | every displayed file runs in Ruby 3.0.1, Python 3.10 and TypeScript (node:vm) and prints the same |
| 6 | done | Python for all 27 levels, with a verified Python example per pattern. TypeScript still shows the Ruby example (decision pending below) |
| 7 | blocked | needs Dojo's `code.run` |
| 8 | evaluated | see below |

## Rules for every phase

- Each phase ends with `npm run check` green, the standalone game identical on GitHub Pages (`base: './'`, same deploy flow) and its CHANGELOG entry.
- One phase = one branch = a small PR or a reviewable series of commits. I do not start a phase without your approval.
- Pedagogical content does not change except what decisions 2 and 3 imply.
- Layers and their architecture test are respected. When a layer is added (`course-kit`), its rule is added to the test; no rule is relaxed.
- Existing tooling stays: oxlint, npm scripts, vitest. Where the sibling course uses ESLint/dependency-cruiser, I reproduce the *rule* with the existing tools (a vitest source-scan, as `architecture.test.ts` already does), not the tool.
- From the first commit of the first phase on, commit messages are in English (history is not rewritten). Co-author lines are not added.

## Order and dependencies

```
1A ─ 1B ─ 1C ─┐
              ├─ 2 ─ 3 ─ 3b ─ 4
5 ─ 6 ─ 7 (conditional)         8 (evaluate only)
```

1A–1C can go in any order among themselves, but all before 2 (the manifest needs stable ids and texts by id). Phase 5 is independent of 2–4 and goes before 6 because Python must be born verified. Phase 3b should happen before a second course builds its own host protocol, so it is scheduled by whenever that second consumer appears, not by Pattern Circuit alone.

---

## Phase 1A — English ids, files and code (criterion 1)

- **Goal:** every identifier is English; level ids are stable and have no ordinal; the code and docs are English.
- **Changes**
  - Node, socket, repair, ticket, scenario and chapter ids and pulse tags to English (`cliente`→`customer`, `tomar`→`take`, `cobrar`→`charge`, `metodo-de-pago`→`payment-method`, `mostrador`→`counter`…).
  - Folders and snippet files with Spanish names to English; level ids without the ordinal (`strategy`, `branches-and-payments`…). Order comes from `order`, not from the name.
  - Saved-progress migration table extending the existing `RENAMED_LEVELS` mechanism (`src/game/progress/progress.ts:63`) and its `level:pattern` / `level/socket` keys; a test that v1.1.0 progress still loads.
  - Mixed-language class names in the shown code (`LatteConAvena`, `PlayaBranch`, `Lealtad`…) to English.
  - Comments and output strings inside the snippets (Ruby and TypeScript) to English (decision 2). This is the only content-adjacent change; I will list the touched comments in the PR so you can review the translations.
  - Comments in the application source, README, CONTRIBUTING (English commits and identifiers), ARCHITECTURE, DESIGN and CHANGELOG (new entries in English; existing entries translated).
- **Files affected:** `src/levels/**` (renames), `src/levels/tracks.ts`, `src/render/theme.ts` (tags), `src/game/progress/progress.ts`, level tests, `docs/*`, `README.md`, `CONTRIBUTING.md`.
- **Risks:** losing existing players' progress (mitigated by the migration table plus a test); breaking `?raw` imports; a huge, unreadable diff → renames done mechanically (`git mv` plus a verifiable script) in commits separate from any edit.
- **Verification:** `npm run check`; a new test "v1.1.0 progress → new ids"; a test that data ids contain no Spanish words (allowlist); `levels.test.ts` unchanged.
- **Estimate:** **M** (mechanical but wide).

## Phase 1B — Id-based i18n with pluggable locales (criterion 2)

- **Goal:** no visible text in components, render or levels; adding a language means adding files, with no code change; key validation for **every** locale. The conventions are the ones agreed for the hub (a locale registry, typed keys, parity checks).
- **Changes (two deliverable batches)**
  1. **Infrastructure + UI/game/render/patterns:**
     - a `LocaleRegistry` as the single source of truth (locales, canonical locale `en`, a `negotiateLocale` that matches exact tag, then primary language, then default);
     - typed keys derived from the source catalog (`module.concept.element`), so a missing key does not compile;
     - the language selector generated from the registry;
     - the English catalog becomes the source; Spanish gets a real catalog file;
     - a vitest source-scan replacing the regex extractor: `ui/`, `render/` and `game/` may only use `t(key)`, no visible literals;
     - parity tests generalized to every registered locale (keys, `{var}` holes, "text equal to source" warning) and an `i18n:scaffold <locale>` script;
     - `index.html` with no fixed texts (title/description from the catalog at build time, `lang` set at runtime).
  2. **Levels:** each level's texts move to `levels/<id>/locales/<locale>.ts` by id. Migrated with a codemod on top of the existing extractor (`levelTexts`, `src/levels/texts.ts`), which also serves as the **oracle**: before and after, the set of rendered texts per locale must be identical across all 27 level variants.
  - `seenIn` becomes per programming language (the Ruby content is kept; TypeScript/Python content is added in phase 6).
  - Placeholders stay `{name}` (a subset of ICU) so ICU MessageFormat can be adopted later without rewriting texts.
- **Files affected:** `src/i18n/*`, `src/ui/I18nProvider.tsx`, `src/ui/*.tsx`, `src/render/*`, `src/game/learning/*`, `src/engine/patterns.ts`, `src/engine/seenIn.ts`, `src/levels/*/level.ts` and `en.ts`, `index.html`, `vite.config.ts`.
- **Risks:** it is the largest change; text regressions (mitigated by the oracle); plurals and holes; keep a fallback to the default locale; stored locale key must keep working (`pattern-circuit:locale`).
- **Verification:** `npm run check`; the oracle test; manual ES/EN pass; an acceptance test that adds a fake locale `xx` using only new files.
- **Estimate:** **XL** (batch 1: M; batch 2: L).

## Phase 1C — Code link and small hardening (criteria 3, 5, 7)

- **Goal:** remove brittle spots without changing visible behavior.
- **Changes**
  - Language-neutral region ids (`Counter#hand_over` stays an id) plus a per-language label shown in the panel, so the TypeScript panel stops showing Ruby names (`CodePanel.tsx:103`).
  - Branded types for `NodeId`, `SocketId`, `RegionName`, `UnitId` where the schema already knows them; `FlowState` as a discriminated union if the diff stays proportionate (if not, reported and left).
  - `window.confirm` → an own accessible dialog (`Notebook.tsx:40`; `useDialog` already exists).
  - A structural parity test across languages: same regions in `rb` and `ts` (and Python later).
- **Risks:** low. The dialog swaps a native `confirm` for the game's own dialog.
- **Verification:** new region and dialog tests; `npm run check`.
- **Estimate:** **S–M**.

## Phase 2 — Manifest and `HostBridge` with the standalone adapter

- **Goal:** Pattern Circuit speaks the contract with no visible change.
- **Changes**
  - `src/course-kit/` (no imports from the rest of the app; new rule in `architecture.test.ts`): zod schemas for the manifest and the protocol, types, `HostBridge`, `CodeRunner`/`RunOutcome`, `negotiateLocale`.
  - `course.json` generated at build time from `LEVELS`/`TRACKS`/catalogs and published next to `index.html`; a test validates it against the schema and the real levels.
  - `StandaloneHostBridge`: moves the `localStorage` access, today split between `GameApp.tsx` (progress, code language) and `I18nProvider.tsx` (locale), into one place; `GameApp` consumes the port.
  - Boundary mapping of programming-language ids `rb`/`ts` → `ruby`/`typescript` (renaming the internal ids waits for phase 6).
  - Emission of `unit.started`/`unit.completed`/`course.progress` to the bridge (nothing visible in standalone).
- **Files affected:** `src/course-kit/*` (new), `src/ui/GameApp.tsx`, `src/ui/I18nProvider.tsx`, `src/game/session/GameSession.ts`, `src/architecture.test.ts`, `vite.config.ts`, `package.json`.
- **Risks:** moving persistence could change `localStorage` keys (they stay identical; compatibility test with v1.1.0 data); over-engineering → the port holds only what the ADR uses.
- **Verification:** `npm run check`; the manifest test; standalone adapter tests with a fake `Storage` and with blocked storage; manual check on Pages: same progress, same language.
- **Estimate:** **M**.

## Phase 3 — Embedded adapter + test host page

- **Goal:** validate the iframe without depending on Dojo.
- **Changes**
  - `EmbeddedHostBridge`: handshake with retries, exact origin from `#ck-host`, `event.source === parent`, inbound zod validation, degradation to standalone when the host is silent, size caps.
  - Behavior that changes only when embedded: keyboard handled only while the course has focus; no `confirm`; no dependence on `localStorage`; `minViewport` respected instead of the fixed 600 px `desktop-only` notice; `100vh` → container height; pause on `host.visibility`; `host.navigate` opens a level; the language switches *request* and obey `host.locale`/`host.codeLanguage`.
  - A **test host page** in the repo (`host-test/`, outside the published bundle): a mini host implementing the host side of the protocol, showing events, storing progress in its own `localStorage`, simulating a login with merge and sending themes. Served on a **different origin** than the course (two ports) to reproduce real storage and origin conditions.
- **Files affected:** `src/course-kit/embedded/*`, `src/ui/GameApp.tsx`, `src/ui/shortcuts.ts`, `src/ui/Notebook.tsx`, `src/ui/game.css`, `host-test/*` (new), `package.json` (`host:test` script).
- **Risks:** (1) `localStorage` and Pixi `resizeTo` behavior in cross-origin iframes per browser → verified here with Chrome, Firefox and, if available, Safari; (2) handshake races → tests with a fake clock; (3) focus and keyboard in the iframe.
- **Verification:** protocol unit tests (invalid message, wrong origin, incompatible version, silent host → standalone, retries); manual run with the test host: handshake, progress surviving a host reload, simulated merge, language change from the host, iframe resize, keyboard-only navigation; screenshots as evidence.
- **Estimate:** **L**.

## Phase 3b — Extract `@rodacato/course-kit` (new)

- **Goal:** the contract becomes a package with at least two real consumers (Pattern Circuit and the next course), before a second protocol appears.
- **Changes:** move `src/course-kit/` unchanged to its own repo/package with semver, `zod` as a peer dependency, generated JSON Schema, its own tests and a README; Pattern Circuit consumes it from npm.
- **Needs from you before starting** (outward-facing): where the package is published (public npm, GitHub Packages, or only a git dependency, since everything else in the hub is a static GitHub Pages site), its scope and its repo. I will ask again at that point; I do not publish anything on my own.
- **Risks:** publishing discipline; version skew between consumers (mitigated by the protocol's min/max handshake).
- **Verification:** both consumers build and pass their checks against the published package; the test host still works.
- **Estimate:** **M**.
- **Milestone for Dojo:** from here Dojo can start its host side (ADR §9).

## Phase 4 — Receiving the theme

- **Goal:** the chrome adopts the host theme without losing the neon identity.
- **Changes:** CSS variables for chrome fed by `host.theme` (defaults equal to today's, so standalone does not change); a `RenderTheme` injected into `NeonStage.create` (like the translator) separating **chrome** (adjustable) from **identity** (pulse, family and state colors and glow: fixed); stage always dark; mode → Shiki theme map (light/dark); strict validation of values (hex, families and radii only) and `honors` declared in the manifest.
- **Files affected:** `src/ui/game.css`, `src/render/theme.ts`, `src/render/NeonStage.ts`, `src/ui/code/highlight.ts`, `src/course-kit/theme.ts`, `host-test/`.
- **Risks:** a dark stage inside a light chrome may look uneven → visual review with Dojo's three themes (`slate`, `sumi`, `washi`); accessible contrast with arbitrary tokens (a minimum contrast is checked and a failing token is ignored).
- **Verification:** tests for validation and mapping; screenshots with the three themes on the test host; contrast review.
- **Estimate:** **M**.

## Phase 5 — Extended verification of the shown code (criterion 9)

- **Goal:** CI verifies all the code the player sees, in every language, beyond syntax.
- **Changes**
  - **L2 static:** `tsc --noEmit` over the assembled TypeScript snippets with ambient *stubs* (`CardTerminal`, `Stripe`…), `ruby -wc` + an agreed linter, and the same scheme ready for Python.
  - **L3 execution:** a stub prelude per level and expected output for the `wiring` block; run Ruby and Node/TS (and Python later) in CI and compare with a golden.
  - **L4 parity:** same output in every language per variant.
  - **Pinned runtime baselines** equal to Dojo's Piston (Ruby 3.0.1, Python 3.10, TypeScript 5.0), so "passes CI" means "runs in Dojo".
  - Make a missing interpreter fail in CI (`CI=true` + missing tool = error) while still skipping locally.
  - One `LanguageVerifier` adapter per language, so Python means adding an adapter.
- **Files affected:** `src/levels/*.test.ts` (reorganized under `verification/`), preludes and goldens next to each level, `.github/workflows/*.yml`, `docs/ARCHITECTURE.md`, a separate verification `tsconfig` (the snippets stay outside the app's `tsc`).
- **Risks:** snippets are partial by design (concatenations, fictional externals) → writing stubs for 27 levels is content-adjacent work; running 138×N processes lengthens CI (mitigation: one process per language and level); it may expose real errors in the examples (reported before fixing).
- **Verification:** the CI run itself; a manual mutation test (deliberately break a snippet and see that each rung catches it).
- **Estimate:** **L**.

## Phase 6 — Python as the third language

- **Goal:** idiomatic Python with the same regions, verified in CI.
- **Changes:** a language registry (`ruby`/`typescript`/`python` with label, Shiki grammar, comment marker, verifier) and a `code: Record<CodeLanguageId, …>` schema with no privileged Ruby (the points in AUDIT §4); 138 Python snippets with the same keys and regions; `seenIn` for Python and TypeScript (new content verified against sources, like the rest); a generic language preference; per-language UI texts in the catalog.
- **Files affected:** `src/engine/schema.ts`, `src/engine/level/define.ts`, `src/game/session/GameSession.ts`, `src/ui/CodePanel.tsx`, `src/ui/GameApp.tsx`, `src/ui/code/highlight.ts`, `src/levels/*/py/*.py`, `src/engine/seenIn.ts`, the phase 5 verification.
- **Risks:** idiomatic quality (reviewed against a style guide: `dataclass`, `Protocol`, `typing`, no line-by-line translation from Ruby) and parity of the story across languages; large content load; bundle size (Shiki's Python grammar, loaded on demand).
- **Verification:** the whole phase 5 ladder green for Python; a sample review of 3 levels by someone who writes Python daily (you); `npm run check`.
- **Estimate:** **L–XL** (dominated by writing and reviewing content).

## Phase 7 — `CodeRunner`: run the shown code (conditional)

- **Goal:** where it adds value, the player runs the real code through Dojo's Piston.
- **Scope (decision 7):** (a) a "Run" button in the code panel on final variants, using the phase 5 preludes so the player sees the same output the animation showed; (b) the host `CodeRunner` adapter (`course.code.run`). Nothing else.
- **Condition:** starts only when Dojo has `code.run` (multi-file, see ADR §9.8). Until then the capability stays `codeRunner: 'none'`.
- **Out of this plan:** "write the pattern" exercises change the nature of the game (circuit → code exercise); they are a separate experiment with their own proposal.
- **Verification:** adapter against a simulated host; a test that `codeRunner: 'optional'` degrades cleanly without a runner and that a `syntax-checked` outcome is never shown as a pass.
- **Estimate:** **M**.

## Phase 8 — Visual theme layer / alternative metaphor (evaluate only)

- **What it is:** being able to change the metaphor (cafeteria → something else) without touching the levels.
- **Finding (updated after 1B and 6):** the engine does not know the cafeteria. Since 1B the player-facing prose is catalogs (`levels/*/locales`), so a metaphor's words could be another catalog set. What still binds a level to the metaphor is (1) the level data itself (node ids and `className`s such as `Cashier` and `Barista`, tags, scenarios, pulse data), (2) the code snippets, which are the same story written three times (Ruby, TypeScript, Python: about 120 files each, with `codeRef`s pointing into them), and (3) the node skins. The snippets, not the texts, are the dominant cost: a second metaphor means rewriting and re-verifying all of them in every language.
- **Proposal:** do not build it now. A metaphor would be a package of level data plus catalogs plus snippets, not a theme switch; it is a new course that reuses the engine. Reassess after the next course ships, which will show whether a second metaphor is real.
- **Estimate:** **XL** if built; the evaluation itself, **S**.

---

## Dojo side (reference; not implemented here)

ADR §9: embedded scroll kind, manifest sync, `EmbeddedScrollPlayer`, progress and `state`, milestones, locale preference, theme bridge, `code.run` (multi-file), and `frame-src`/documentation.
