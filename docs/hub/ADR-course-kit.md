# ADR 025: course-kit — the contract between Dojo and embedded interactive courses

**Status:** Superseded by [PROTOCOL-ALIGNMENT.md](PROTOCOL-ALIGNMENT.md). Dojo published its own scroll protocol (its ADR 025–029) after this draft was written, and number 025 is taken. Kept for history; the ideas that survive are listed there.
**Date:** 2026-10-02 (revised after the first review round)
**Related:** [ADR 015](015-courses-bounded-context.md) (Learning context), [ADR 016](016-iframe-sandbox-browser-execution.md) (iframe sandbox), [ADR 020](020-ubiquitous-language-pass.md) (ubiquitous language), [ADR 021](021-sumi-e-dual-theme-architecture.md) (theme tokens), [ADR 022](022-crash-course-pivot.md) (scroll catalog shape), [ADR 024](024-self-hosted-hub-pivot.md) (self-hosted hub); Domain Wall `docs/adr/0001` (hexagonal, embeddable), `0005` (execution delegated to the host), `0006` (locale registry) and `docs/proposal/muro-proposal.md` §4.3–4.4 (its draft host protocol)

## Context

Dojo is becoming a self-hosted learning hub (ADR 024). Two interactive courses will plug into it:

- **Pattern Circuit**: a standalone static game (React + PixiJS, 27 levels, ES/EN, Ruby/TypeScript snippets, progress in `localStorage`, npm, deployed on GitHub Pages).
- **Domain Wall** (`learning/ddd`, in phase 1): an interactive DDD course on an Event Storming wall (pnpm, hexagonal with dependency-cruiser, `LocaleRegistry`, `ProgressRepository` over IndexedDB, `CodeRunner` with `RunOutcome`, and a *draft* `postMessage` protocol in proposal §4.4 that is defined and typed but not integrated with Dojo).

What exists in Dojo that this must fit:

- A **scroll** is the learning-path aggregate; progress is the set of completed **steps** per owner (user or anonymous). Anonymous progress lives server-side keyed by a `localStorage` UUID and is merged by set union at sign-in (`MergeAnonymousProgress.ts`). `ScrollCompleted` is published when all steps are done (user accounts only) and `MilestoneEventHandler` maps a scroll slug to a milestone with a hard-coded table.
- Code execution: `POST /scrolls/execute` (Piston; single `code` + `testCode` strings) and the hardened playground `run` path; results are `ExecuteStepResponse`. Dojo's Piston runs Ruby 3.0.1, Python 3.10/3.12 and TypeScript 5.0.3 with no extra packages, and request bodies are limited to ~100 KB (Domain Wall's phase 1 spike).
- One iframe protocol exists: the hidden `javascript-dom` runner posts `{ type: 'test-results' }` with `'*'` as target origin and the parent only checks `event.source` (ADR 016).
- The web app serves `X-Frame-Options: DENY` and `frame-src 'self' https://challenges.cloudflare.com`; the API has a single-origin CORS policy and Bearer auth from `localStorage`.
- Theming: `--color-*` tokens switched with `[data-theme]` (`slate`, `sumi`, `washi`); `useThemeTokens` already reads resolved values.
- The web app is English-only; scrolls have no human-language field (`language` means programming language).

Both courses must keep working standalone, exactly as they do today. Integration is an additional capability. Because Domain Wall already drafted its own protocol, the cheapest moment to make it a shared one is now, before either side implements it.

## Decision

Define **course-kit**: a small, versioned contract with five parts, implemented by a host (Dojo) and by each course:

1. a **course manifest** (static JSON the course publishes);
2. a **message protocol** over `postMessage` (typed, versioned, origin-checked);
3. two **ports** on the course side: `HostBridge` (standalone and embedded adapters) and `CodeRunner`;
4. a **progress model** where the host is the source of truth when embedded;
5. a **theme token set** the host may send and the course may honor.

(`course-kit` is the name of this shared contract and of the package that will carry it. It is not a course; the courses are Pattern Circuit and Domain Wall.)

Design rules:

- **The course never learns Dojo's rules** (belts, milestones, auth, LLM). It reports facts (unit completed) and asks for services (run this code). Dojo decides what those facts mean.
- **The host never learns the course's internals.** It stores one opaque `state` blob per course it cannot interpret.
- **The iframe never receives credentials and never calls the Dojo API.** Everything goes through the host over `postMessage`.
- **Everything is optional for the course author except the manifest and the handshake.** A course that ignores themes, code running and preferences still integrates.
- **Unknown is not an error.** Unknown message types and unknown fields are ignored, so either side can add capabilities without a major version.

### 1. Vocabulary mapping

course-kit is the discipline-level word (like `docs/courses/`); the product noun stays **scroll** (ADR 020/022).

| course-kit | Dojo | Pattern Circuit | Domain Wall |
|---|---|---|---|
| course | an *embedded scroll* (its player is an iframe) | the game (`pattern-circuit`) | the course (`domain-wall`) |
| group | **lesson** | chapter (`counter`, `rush-hour`…) | module (10) |
| unit | **step** | level | concept (`conceptId`) |
| unit completed | step added to `completedSteps` | `Progress.completed` | `markConceptCompleted` |
| course completed | `ScrollCompleted` → milestone | all levels completed | all concepts completed |
| host preferences | user locale / theme / code language | locale and code-language keys | `preferences` |

### 2. Course manifest

Published at `<course base URL>/course.json` (relative URLs resolve against it). The course generates it at build time from its own data, and a test keeps it in sync.

```ts
type LocaleId = string            // BCP 47 tag, e.g. 'es-MX', 'en'
type CodeLanguageId = string      // Dojo/Piston ids: 'ruby', 'typescript', 'python'
type Localized = Record<LocaleId, string>

interface CourseManifest {
  schema: 1                       // manifest schema version
  id: string                      // stable slug, /^[a-z0-9-]+$/, maps to the scroll slug
  version: string                 // semver of the course content
  protocol: { min: number; max: number }   // course-kit protocol versions the course speaks
  title: Localized
  description: Localized
  locales: LocaleId[]             // non-empty
  defaultLocale: LocaleId         // must be in `locales`
  codeLanguages: CodeLanguageId[] // [] if the course shows no code
  defaultCodeLanguage?: CodeLanguageId
  entry: string                   // URL of the embeddable page, relative to the manifest
  groups: { id: string; title: Localized }[]            // ordered
  units: {
    id: string                    // STABLE, never reused, no ordinal in it
    group: string                 // a group id
    title: Localized
    estimatedMinutes?: number
  }[]                             // ordered; array order is the canonical order
  completion: { requires: 'all' | string[] }            // unit ids that complete the course
  capabilities: {
    codeRunner: 'none' | 'optional'          // 'optional': works without a runner, better with one
    theming?: { modes: ('light' | 'dark')[]; honors: ThemeTokenName[] }
    minViewport?: { width: number; height: number }     // below this the course is not usable
    persistsOwnState: boolean                // true if standalone mode keeps its own storage
  }
}
```

Rules:

- Unit ids are **opaque and permanent**. (Pattern Circuit's ordinal ids such as `L24-…` already forced a rename once; its manifest ids drop the ordinal and the course keeps a legacy-id map. Domain Wall's `conceptId` already follows this rule.) Removing a unit is allowed; the host keeps old completions but stops counting them.
- `completion.requires` says which units complete the course; the host computes `ScrollCompleted` itself from the manifest and the unit events.
- **Locale negotiation:** the host picks the course locale by the same algorithm Domain Wall already implements (`negotiateLocale`): exact tag match, then same primary language subtag, then `defaultLocale`; the course receives a tag that is in its own `locales`.

Example (Pattern Circuit, abridged):

```json
{
  "schema": 1, "id": "pattern-circuit", "version": "1.2.0",
  "protocol": { "min": 1, "max": 1 },
  "title": { "es-MX": "Patrones de diseño", "en": "Design Patterns" },
  "description": { "es-MX": "…", "en": "…" },
  "locales": ["es-MX", "en"], "defaultLocale": "en",
  "codeLanguages": ["ruby", "typescript"], "defaultCodeLanguage": "ruby",
  "entry": "./index.html",
  "groups": [{ "id": "counter", "title": { "es-MX": "El mostrador", "en": "The counter" } }],
  "units": [{ "id": "strategy", "group": "counter", "title": { "es-MX": "¿Efectivo o tarjeta?", "en": "Cash or card?" } }],
  "completion": { "requires": "all" },
  "capabilities": { "codeRunner": "none", "persistsOwnState": true,
    "theming": { "modes": ["dark"], "honors": ["surface", "border", "textPrimary", "textSecondary", "fontSans", "fontMono"] },
    "minViewport": { "width": 640, "height": 480 } }
}
```

### 3. Message protocol

**Envelope** (every message, both directions):

```ts
interface Envelope<T extends string, P> {
  channel: 'course-kit'   // discriminator: other postMessage traffic is ignored
  v: number               // protocol version in use
  type: T
  id: string              // unique per message
  replyTo?: string        // id of the request this answers (replaces a separate requestId)
  payload: P
}
```

**Validation.** Every inbound message is parsed with the contract's schemas (unknown fields stripped, unknown `type` ignored, invalid messages dropped and counted, never thrown). Size caps: 256 KB per message, `state` ≤ 64 KB, and a run request's files ≤ 100 KB in total (Piston's body limit).

**Origin rules** (the self-hosted hub means the host origin is not known in advance):

- *Host side:* the iframe `src` is `<entry>#ck-host=<host origin>&ck-protocol=1`. The host accepts a message only if `event.source === iframe.contentWindow` **and** `event.origin` equals the origin of the course `entry` URL (from the manifest URL the operator registered). It always posts with that exact `targetOrigin`.
- *Course side:* if the URL fragment has no `ck-host`, the course runs standalone and installs no listener. Otherwise it accepts messages only if `event.source === window.parent` **and** `event.origin === ck-host`, and posts to the parent with `targetOrigin = ck-host`. Never `'*'`. A course may additionally ship a build-time allowlist of host origins.
- The fragment is not sent to the server and does not affect caching.

**Handshake.**

1. Host registers its listener *before* setting the iframe `src`.
2. Course sends `course.hello`; it repeats every 400 ms until it gets `host.init` (max 5 s).
3. Host replies `host.init` with the negotiated protocol (highest version in both ranges). If there is none, it sends `host.incompatible` instead and the course shows its standalone UI with an explanatory banner.
4. Course applies the config and sends `course.ready`.
5. If no `host.init` arrives, the course degrades to **standalone** (its own storage) and shows a non-blocking notice that it is not connected to its host.

**Messages.**

Course → host:

| type | payload | notes |
|---|---|---|
| `course.hello` | `{ courseId, courseVersion, protocol: {min,max} }` | repeated until answered |
| `course.ready` | `{}` | UI rendered with the host config |
| `course.unit.started` | `{ unitId }` | |
| `course.unit.completed` | `{ unitId, detail?: Record<string, number\|string\|boolean> }` | `detail` is informational (attempts, `packId`, programming language…); the host must not depend on it |
| `course.completed` | `{}` | convenience; the host recomputes it from the manifest |
| `course.progress` | `{ rev, progress: Progress }` | full idempotent snapshot, debounced (≥ 500 ms) |
| `course.preference.requested` | `{ locale?, codeLanguage? }` | in embedded mode the host owns preferences; the course's switches apply the change at once and *inform* the host, which keeps it and may later send `host.locale` / `host.codeLanguage` (what the host itself sends is acknowledged, never echoed back) |
| `course.code.run` | `{ request: RunRequest }` | only if `capabilities.codeRunner ≠ 'none'` and `init.features.codeRunner` |
| `course.resize` | `{ height }` | optional, for hosts that size the iframe to content |
| `course.error` | `{ code, message }` | reported to the host's error pipeline; no user data |

Host → course:

| type | payload | notes |
|---|---|---|
| `host.init` | `{ protocol, locale, codeLanguage?, theme?, reducedMotion?, progress, features: { codeRunner: boolean }, unitId? }` | `unitId` = deep link |
| `host.locale` / `host.codeLanguage` | `{ value }` | |
| `host.theme` | `{ theme }` | see §6 |
| `host.progress` | `{ progress }` | replaces the course's progress (e.g. after login merge) |
| `host.visibility` | `{ visible }` | pause animation/timers when hidden |
| `host.navigate` | `{ unitId }` | open a unit from the host's table of contents |
| `host.code.result` | `{ outcome: RunOutcome }` | `replyTo` = the request's `id` |
| `host.incompatible` | `{ hostProtocol: {min,max} }` | |

Course-specific choices (for example Domain Wall's industry) are not host preferences: the course keeps them in its own `state`.

**Versioning.** `protocol` is an integer major. Within a major, additions are optional fields and new message types (ignored by older peers). Breaking changes bump the major; both sides advertise a `{min,max}` range in the handshake. The manifest's `schema` is versioned separately.

**Standalone behavior (no host).** The course behaves as it does today: own storage for progress and preferences, own language switch, no listener, no network beyond its own assets. The standalone adapter implements the same `HostBridge` port, so course code has no `if (embedded)` branches.

### 3.1 Transport

The contract (messages, manifest, ports) is **transport-agnostic**; `postMessage` between an iframe and its parent is the first transport, not the contract. The course codes against `HostBridge`, so a different transport is just another adapter.

| Transport | Status | When |
|---|---|---|
| iframe + `postMessage`, course on its own origin | **Default (v1)** | self-hosted hub with courses as independent static sites; the course never sees credentials |
| Same bytes, served from the host's own origin (vendored `dist/`, e.g. `/courses/<id>/`) | Supported as a *deployment* variant | offline or air-gapped instances, first-party courses; the same protocol and sandbox rules keep working, it only removes the dependency on the course's hosting |
| In-process mount (`mount(element, bridge)` as a component) | Possible later adapter | only if the iframe's costs (sizing, focus, deep links) outweigh isolation; needs the course to scope its global styles and key handlers first |
| Course calls the host API directly with a token | Rejected | puts credentials in the course and needs CORS per course origin |

Whatever the transport, **session data reaches a course only as derived data** (locale, progress, theme; an explicit optional field if a course ever needs an identity hint), **never as a token**, and **code always runs through the host**: Piston has no authentication, and the host owns the queue, rate limits and language whitelist.

### 4. Ports (course side)

```ts
interface HostBridge {
  readonly mode: 'standalone' | 'embedded'
  start(): Promise<HostInit>                     // resolves immediately in standalone
  emit(event: CourseEvent): void                 // unit.started | unit.completed | completed | progress | error | preference.requested
  onCommand(handler: (cmd: HostCommand) => void): () => void   // locale | codeLanguage | theme | progress | visibility | navigate
  readonly codeRunner?: CodeRunner               // present only if the host offers it
}

interface CodeRunner {
  run(request: RunRequest): Promise<RunOutcome>
}

interface RunRequest {
  language: CodeLanguageId
  files: { path: string; content: string }[]     // multi-file, as Piston accepts
  entry: string                                  // file to run, or the test entry
  timeoutMs?: number                             // capped by the host
}

// A discriminated union, never a boolean: the UI must not claim a pass that did not happen.
type RunOutcome =
  | { kind: 'executed'; tests: { name: string; passed: boolean; message?: string }[]; stdout: string; stderr: string; durationMs: number;
      errorKind?: 'runtime' | 'compile' | 'timeout' | 'sandbox' | 'output-exceeded' }
  | { kind: 'syntax-checked'; diagnostics: { line: number; message: string }[] }   // tests NOT executed
  | { kind: 'unavailable'; reason: string }
```

This is Domain Wall's `RunRequest`/`RunOutcome` (ADR 5), with the executed branch using Dojo's `errorKind` vocabulary so the host adapter maps `ExecuteStepResponse` directly.

Adapters on the course side: `StandaloneHostBridge` (today's behavior; `codeRunner` absent or a local one) and `EmbeddedHostBridge` (the protocol above). Both take their I/O (`storage`, `window`) by injection, so they are testable without a DOM. `CodeRunner` adapters: **host** (sends `course.code.run`; Dojo runs it in Piston) and **local** (Domain Wall's tree-sitter syntax checker returns `syntax-checked`). A course with `codeRunner: 'optional'` degrades to "view only" or syntax checks when there is no runner.

### 5. Progress

```ts
interface Progress {
  completedUnits: string[]        // grow-only set of unit ids
  startedUnits?: string[]
  state?: unknown                 // opaque to the host, owned and versioned by the course (≤ 64 KB)
  stateVersion?: number
}
```

**Source of truth.**

| Mode | Authority | Storage |
|---|---|---|
| Standalone | the course | its own `localStorage` / IndexedDB (as today) |
| Embedded | **the host** | Dojo (server, for anonymous-by-UUID and user owners). The course keeps memory only; any local copy is a cache the host overrides. (A third-party iframe's storage is partitioned by top-level site and can be purged, so it cannot be the record.) |

Both courses already isolate persistence behind a port (`ProgressStore` in Pattern Circuit, `ProgressRepository` in Domain Wall); the embedded adapter is another implementation of that port.

Embedded flow: `host.init.progress` is authoritative → the course renders from it → on every change it sends `course.unit.completed` (immediate) and `course.progress` (debounced snapshot with a monotonic `rev`; a lost message is repaired by the next snapshot). `host.progress` replaces the course's progress at any time (login merge).

**Merge** (anonymous → account, at the same moment Dojo merges scrolls today):

- `completedUnits`: **set union**, computed by the host. The rule is part of the contract so any host behaves the same. It is exactly what `MergeAnonymousProgress` does for `completedSteps`.
- `state`: the host cannot interpret it, so v1 is **last writer wins by `rev`**. A course-side merge (`mergeProgress(a, b)` with the other side delivered as `progress.incomingState`) is reserved for a later minor version; the field name is reserved now, unused.
- Progress made while using a course standalone is not imported automatically: the embedded course usually cannot see that storage. A future explicit export/import can feed it.

**Mapping to Dojo milestones without the course knowing Dojo.** The course only emits unit ids. In Dojo an embedded scroll is a normal scroll: groups become **lessons**, units become **steps** (`steps.data = { unitId }`, ids from `seedUuid(slug + ':' + unitId)`), so `TrackProgress`, `GET /scrolls/progress`, anonymous ownership, merge and `ScrollCompleted` work unchanged. The milestone is host policy in `MilestoneEventHandler` (slug → milestone row), as for every other scroll. Group-level or unit-level milestones would be additional host-side rules over the same ids; the course needs no change.

Completion is **attestation, not proof** (the course runs on the client). That is consistent with ADR 020 (belts never consume scroll results) and with scrolls having no leaderboard.

### 6. Theme

```ts
type ThemeTokenName =
  | 'page' | 'surface' | 'elevated' | 'border'
  | 'accent' | 'onAccent' | 'success' | 'danger' | 'warning'
  | 'textPrimary' | 'textSecondary' | 'textMuted'
  | 'fontSans' | 'fontMono' | 'radiusSm' | 'radiusMd'

interface Theme {
  mode: 'light' | 'dark'
  tokens?: Partial<Record<ThemeTokenName, string>>
}
```

Names mirror Dojo's `--color-*`/`--font-*`/`--radius-*` tokens, so the host builds the message from the same source as `useThemeTokens` (which today lacks fonts, radius and `onAccent`; they get added). `{ mode, tokens? }` is the shape Domain Wall already drafted. Values are validated: colors `^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$`, fonts a restricted family-name charset, radii `^\d{1,2}px$`. No URLs, no CSS text: a theme can restyle but cannot load anything or inject CSS.

**How a course applies it without losing identity.** The course declares in the manifest which tokens it honors and which modes it supports. It maps tokens to its own CSS variables for **chrome** (header, panels, cards, code panel, typography). It keeps a **reserved identity layer** that no host token overrides: the semantic palette that carries meaning inside its visual language. For Pattern Circuit that is the stage (circuit canvas): pulse colors, family colors, error/ok colors and the additive glow, which needs a dark ground; the stage stays dark even under a light host theme and reads as a "monitor" inside the page. A course that cannot honor a mode (for example dark-only) keeps its own and says so in `capabilities.theming.modes`.

### 7. Security

- Host iframe: `sandbox="allow-scripts allow-same-origin"` (the course keeps its own origin; this does **not** grant access to the host because the origins differ), `referrerpolicy="no-referrer"`, a descriptive `title`, `loading="lazy"`. No `allow-modals`, `allow-top-navigation`, `allow-forms`: courses must not rely on `window.alert/confirm`.
- Dojo's CSP `frame-src` lists exactly the origins of registered courses (operator configuration), nothing broader.
- The course receives no tokens, cookies or user identifiers. It never calls the Dojo API, so Dojo's single-origin CORS needs no change.
- `course.code.run` is honored only for registered course origins, limited to the languages in the manifest ∩ Piston's, rate-limited per user/IP with the existing `executionLimiter`, size-capped, and never returns more than a `RunOutcome`. Anonymous use follows the existing public-language whitelist.
- Inbound validation on both sides (§3). Course-to-host events are untrusted input to Dojo: validated by schema, unit ids checked against the manifest, `detail` stored (if at all) as bounded JSON.
- A third page embedding the course (GitHub Pages cannot set `frame-ancestors`) gets nothing sensitive: the course only posts to the origin named in its own fragment, and an embedder can only feed it harmless config.

### 8. Where the contract lives

Pattern Circuit uses npm; Dojo and Domain Wall use pnpm. Dojo's `@dojo/shared` is `private`, workspace-only and CJS.

| Option | Pros | Cons |
|---|---|---|
| A. A package inside `dojo/packages/shared` | No new publishing; Dojo already has Zod schemas and a 100 % coverage floor | Not consumable by Pattern Circuit or Domain Wall (other repos) without publishing or copying; couples every course to Dojo's release cycle and tooling |
| **B. Its own package (`@rodacato/course-kit`)** | One source of truth for npm and pnpm consumers; semver is the version of the contract; `zod` as a peer dependency; can also emit JSON Schema (`z.toJSONSchema`) | A new repo/publish pipeline to maintain; release discipline for a solo maintainer; speculative generality if published too early |
| C. JSON Schema + TypeScript types copied into each repo | No publishing, works anywhere | Guaranteed drift; protocol logic (codec, bridges) duplicated; no real versioning |

**Recommendation: B, staged.**

1. While Pattern Circuit is the only implementation, the contract lives in `src/course-kit/` inside Pattern Circuit with **no imports from the rest of the app** (enforced by its architecture test) and a test that validates the generated `course.json`.
2. When Pattern Circuit's embedded adapter is proven against a simulated host, and **before Domain Wall implements its host protocol (its phase 3)**, extract it unchanged into `@rodacato/course-kit`. At that point it has two real consumers, which satisfies ADR 024's rule against speculative generality; Dojo becomes the third.
3. Domain Wall replaces its draft §4.4 with the package (the deltas are in the next section).

Trade-off accepted: a short period where the contract is vendored in one repo, and one small amendment to Domain Wall's proposal.

### Alignment with Domain Wall's draft protocol (proposal §4.4)

| Domain Wall draft | course-kit | Why |
|---|---|---|
| envelope `{ source: "muro", protocol: 1, type, payload }` | `{ channel: 'course-kit', v, type, id, replyTo?, payload }` | one discriminator for all courses; `id`/`replyTo` generalizes `requestId` |
| `course:ready { protocolVersion, capabilities }` | `course.hello` → `host.init` → `course.ready`, version *range* negotiation | the host must answer before the course renders, and versions must be negotiable |
| `course:conceptCompleted { conceptId, moduleId, programmingLanguage, packId }` | `course.unit.completed { unitId, detail? }` | the host needs only the unit id; module is derivable from the manifest; `packId`/language go in `detail` |
| `course:runRequested { requestId, language, files, testEntry, timeoutMs }` | `course.code.run { request: RunRequest }` | same fields; `testEntry` becomes `entry` |
| `host:runResult { requestId, outcome }` | `host.code.result { outcome }` with `replyTo` | same `RunOutcome` union plus `unavailable` |
| `host:setLocale`, `host:setTheme { mode, tokens? }`, `host:init { locale?, theme?, programmingLanguage?, industry? }` | `host.locale`, `host.theme { mode, tokens? }`, `host.init` | same; `industry` is course-specific and stays in the course's `state` |
| allowed-origins list | origin from the iframe's own fragment, plus optional build-time allowlist | self-hosted hosts are unknown at build time |
| progress in IndexedDB by `conceptId` | host-owned when embedded; same ids | partitioned third-party storage is not a record |

Domain Wall needs one thing course-kit v1 does not offer: an LLM for pack generation (its `LlmProvider` port uses a user key kept in IndexedDB). Embedded, the key would sit in partitioned storage. That is deliberately out of scope here and listed under open questions; the `features` map in `host.init` is the extension point for a future host-provided service.

### 9. What Dojo must build on the host side (not part of this work)

1. **Scroll kind `embedded`** (`courses` table: `kind`, `manifest_url`; shared Zod/types; `GetScrollList`/DTOs; admin toggle). New migration (next is `0026`).
2. **Manifest sync**: an admin action that fetches the manifest (server-side), validates it, and upserts lessons (groups) and steps (units, with `data.unitId`); handles added/removed units (existing wipe route for orphans).
3. **`EmbeddedScrollPlayer`** in `ScrollPlayerPage`: iframe + host controller (handshake, origin checks, command/event wiring); `STEP_RENDERERS` needs the new type, or the player branches on scroll kind.
4. **Progress**: unit events → existing `POST /scrolls/progress` (works for users and anonymous UUIDs); snapshots/`state` → a new endpoint and a `state jsonb` column on `course_progress`. Optionally fix the existing gap that merging does not publish `ScrollCompleted`.
5. **Milestones**: new `badge_definitions` row + `SCROLL_MILESTONE_BY_SLUG` entry + UI names (three places today).
6. **Locale**: Dojo has no i18n. Simplest first step: negotiate `navigator.languages` against the manifest's `locales` to feed `host.init`. Whether a stored user preference (locale, code language) is needed is decided when the first course is actually connected, not before.
7. **Theme bridge**: extend `useThemeTokens` with fonts/radius/`onAccent`; send `host.theme` on init and on `data-theme` change.
8. **Code running** (when a course asks): `course.code.run` → Piston. `/scrolls/execute` takes one `code` and one `testCode` string, so multi-file requests need a new or extended endpoint; it also bypasses `ExecutionQueue` today.
9. **Security config**: `frame-src` from the registered course origins (env-driven in `nginx.conf.template`), operator documentation, and doc updates (`docs/courses/README.md` §1 says the catalog is closed; embedded scrolls are a new shape that needs its own paragraph).

## Alternatives considered

- **Embed via `srcdoc`/same-origin bundling** (like the DOM runner): requires the host to ship each course's code; defeats independent deployment and self-hosting of courses.
- **Web Components / module federation:** tighter integration but couples frameworks, styles and release cycles; the iframe boundary is the point (isolation, independent deploys).
- **Course calls the Dojo API directly:** needs credentials in the frame and CORS for every course origin; rejected.
- **Progress as an event log instead of snapshots:** more precise, but needs ordering and delivery guarantees across a lossy channel; set-union of units plus idempotent snapshots is enough for scrolls.

## Consequences

- Both courses integrate through one small surface; standalone deployments keep working unchanged.
- Dojo gains one new scroll kind and one player, reusing progress, merge, anonymous ownership, milestones and Piston.
- The contract is versioned from day one; a v2 can coexist through the handshake range.
- Costs: a new package to maintain, a host-side player, a new unit-id discipline (permanent, never ordinal) for every course, and an amendment to Domain Wall's proposal.

## Open questions

1. How `course-kit` is distributed and in which repo it lives (public npm, GitHub Packages, or a git dependency). Both courses and Dojo's own docs/schema are static GitHub Pages sites, so a JSON Schema plus docs site is also an option for non-TypeScript consumers. To be decided before the extraction step, not now.
2. Domain Wall's LLM-generated packs when embedded: a host-provided `llm` service (Dojo already stores a bring-your-own key server-side), or generation only standalone.
3. Whether Dojo's `/scrolls/execute` is extended for multi-file runs or a new endpoint is added (the playground path already has a hardened profile).
