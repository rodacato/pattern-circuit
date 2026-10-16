# One protocol for every course: comparison, proposal and viability

> Draft for review. It supersedes [ADR-course-kit.md](ADR-course-kit.md), which was written before Dojo published its own protocol and is kept only for history.
> Sources read: Dojo `docs/scrolls/PROTOCOL.md`, ADR 025–029, `packages/shared/src/scroll-protocol.ts`, `apps/web/src/lib/scrollHost.ts`, `RecordScrollProgress.ts`, `docs/prd/026-ask-the-sensei.md`; Domain Wall `docs/host-protocol.md` and ADR 0010 (read only); Pattern Circuit's `src/course-kit/`.

## 1. Summary

Three protocols exist today for the same job: Dojo's **scroll v0** (the host's, specified and conformance-tested), Pattern Circuit's **course-kit** (merged, nothing speaks it) and Domain Wall's **host protocol 1** (a draft written in another project). They agree on the architecture and differ on the wire format.

- **Recommendation:** one protocol, owned by Dojo, with Dojo's scroll v0 as the base. Courses adapt to it; it grows only by additions that two courses need.
- Most of what course-kit adds is not needed (section 4.3). Four needs are real: scroll-level state, a programming-language hint, a theme mode, and a safe way to ask the sensei (section 4.2).
- The sensei is the only addition that needs real design. It should not be the generic `llm` message; section 5 proposes a narrower capability.
- Cost of each addition is high (section 6.2), so the policy is: convention before field, field before message, message before capability.

## 2. The three protocols side by side

| Dimension | Dojo scroll v0 | Pattern Circuit course-kit | Domain Wall (Muro) 1 |
|---|---|---|---|
| Envelope | `{dojo:'scroll', v, type, …fields}` flat | `{channel:'course-kit', v, type, id, replyTo?, payload}` | `{source:'muro', protocol, type, payload}` |
| Host origin reaches the course by | `?host=<origin>` | `#ck-host=<origin>` fragment | `?hostOrigin=<origins, comma separated>` |
| Handshake | `hello{nonce}` → `init{nonce, session}`; the nonce proves the answer, the session stops stale or cross-frame messages | `hello` repeated every 400 ms → `init`; version **range** negotiation | `course:ready` → `host:init`; no nonce, no session |
| Spoofing defence | origin + `event.source` + nonce + session, with a conformance rule for each | origin + `event.source` | origin + `event.source` |
| Standalone | MUST post nothing, MUST fall back after 3 s | falls back after 5 s with a notice | ignores everything without `hostOrigin` |
| Manifest | `scroll.json`: id, version, protocol, entry, locales, localized title/description, `programmingLanguages`, `units[{id,title?}]`, `capabilities` | `course.json`: the same plus `groups`, `defaultCodeLanguage`, `completion`, `capabilities.theming/minViewport/persistsOwnState/codeRunner` | none yet |
| Progress | per unit: `progress{unitId, completed?, state?}`, `complete{unitId?}`; host stores `{completed, state}` per unit; `state` ≤ 64 KiB; `init.progress` replays it | unit events + one opaque `state` blob, last writer wins by `rev`; host can replace progress | `conceptCompleted{conceptId, moduleId, programmingLanguage, packId}` |
| Locale / theme | `init.locale`, `setLocale`; theme = flat token map (`--color-page`, `-surface`, `-accent`…, 11 colors) | locale + theme `{mode, tokens}` incl. fonts and radii, validated | `host:init.locale/theme{mode,tokens}`, `setLocale`, `setTheme` |
| Preferences from the course | none (host owns) | `preference.requested` | none |
| Programming language | none (only `programmingLanguages` in the manifest) | host `codeLanguage` + course requests | `init.programmingLanguage`, `industry` |
| Running code | `run{id, language, files≤8, stdin}` → `result{kind, exitCode, stdout, stderr, durationMs}`; raw output; signed-in users only; host never parses | `RunRequest` → `RunOutcome` union `executed \| syntax-checked \| unavailable` | `runRequested{files, testEntry, timeoutMs}` → `runResult{outcome}` with structured `tests[]` |
| Language model | `llm` capability **reserved**, never granted | not covered | `llmRequested{system, user, jsonSchema}` (draft) |
| Extras | `resize`, `error` | `visibility`, `navigate`, `reducedMotion`, `resize`, `error` | `?theme=` URL parameter |
| Schemas | Zod in `@dojo/shared` → JSON Schema in `docs/scrolls/schema/` (drift test) | Zod in `src/course-kit` | Zod in the course |
| Verification | `scroll-conformance`: 18 rules over real browser traces, 8 scenarios, deliberately broken fixtures | unit tests with a fake window, a test host page | `e2e/host.e2e.ts` |

## 3. What the comparison says

1. **The architecture is already shared**: iframe, `postMessage`, host owns identity and progress, host runs code, the course works alone. Nothing here is in dispute.
2. **Dojo's handshake is stronger than mine.** Nonce plus session closes spoofing cases my design left open (a second frame, a replayed `init`), and it is already checked by conformance. I should not keep mine.
3. **Dojo's progress model is simpler than mine** (per unit instead of one blob with revisions) and enough for Pattern Circuit, with one gap (G1 below).
4. **Domain Wall and Pattern Circuit have the same four real needs** that Dojo v0 lacks, which is exactly the "two consumers" evidence the protocol is waiting for (ADR 026: it stays v0 until both courses use it).
5. **Most of course-kit's extra messages exist because I designed in the abstract.** The platform already covers them (4.3).

## 4. Differences, classified

### 4.1 Take Dojo's, drop ours

Envelope, `?host=`, nonce and session handshake, timeouts (10 s `hello`, 3 s `init`), per-unit progress, `complete`, `resize`, `error`, `setLocale`, `setTheme`, capabilities granted by the host, `run`/`result` with raw output, `userRef`/`authenticated`, `scroll.json`.

Domain Wall's structured test results do **not** need a protocol change: its generated harness already prints one JSON line per test, and Dojo's `result.stdout` carries it back; the course parses its own output (this is what ADR 028 intends). `syntaxChecked` is a course-side fallback when the host answers `unavailable` or never grants `run`.

### 4.2 Real gaps (needed by Pattern Circuit and Domain Wall, absent from v0)

| # | Gap | Who needs it | Smallest fix | Cost in Dojo |
|---|---|---|---|---|
| G1 | **Scroll-level state.** `progress` requires a `unitId` that is in the manifest, and `complete` without a unit marks the whole scroll but carries no state. Pattern Circuit keeps notes, predictions and spaced-review data; Domain Wall keeps its industry and pack choice. | PC, DW | Let `progress` omit `unitId` to store scroll-level `state`, and return it in `init` (for example `init.state`). The API already records `unitId = null` rows internally (`RecordScrollProgress`). | schema, API route, DTO, shim, conformance rule, doc |
| G2 | **Programming-language hint.** The host knows the learner's languages; courses show code or generate code in one. | PC, DW | Optional `init.programmingLanguage` (a manifest `programmingLanguages` id). The course keeps its own later switches in its `state`; no new message. | init schema, host, shim, doc |
| G3 | **Light or dark theme.** The token map carries colors only; a course cannot tell the mode without guessing from luminance. | PC, DW | A convention, no schema change: reserved token `--color-scheme` with `light` or `dark`. Optional `--font-sans`, `--font-mono`. | host adds the keys, doc |
| G4 | **Talking to the sensei.** Courses that teach may want a hint or a review from the host's mentor. `llm` is reserved and, as drafted by Domain Wall, would let a course send arbitrary prompts. | DW (draft), Dojo's own PRD 026 | A narrower capability, section 5. | new capability, route, queue, limits |

Restart is **already expressible**: `progress{unitId, completed:false}` un-completes a unit (the API honors an explicit `false`). Two small frictions to document: `state` cannot be cleared to null (send `{}`), and a full restart is one message per unit; a bulk reset can wait until it hurts.

### 4.3 Drop: course-kit had it, the platform or a convention already covers it

| course-kit feature | Replacement |
|---|---|
| `host.visibility` (pause when hidden) | `document.visibilityState` and `visibilitychange` work inside an iframe |
| `reducedMotion` | `prefers-reduced-motion` media query reaches the iframe |
| `host.navigate{unitId}` | the host appends `&unit=<id>` to the entry URL (convention) |
| `preference.requested` | the course keeps its own switches (language, code language) in `localStorage` standalone and in its `state` embedded; the host only sets defaults |
| version range negotiation | one integer `v`; the host refuses what it does not support (v0 spec). Revisit at the first v1 |
| `host.progress` (host replaces progress live) | progress arrives in `init`; to apply a host-side change, reload the frame |
| theme fonts and radii as typed fields | optional tokens (G3) |
| `groups` in the manifest | the course draws its own map; add an optional `units[].group` only when Dojo's UI uses it |
| `codeRunner: none/optional` capability field | `capabilities: ['run']` plus `programmingLanguages` already say it |

## 5. The sensei: design proposal for G4

**Constraint:** Dojo's sensei has a voice and honesty rules (PRD 026: point toward the mistake, never hand over the fix) and costs money per call. A scroll is an untrusted client (ADR 027). So the course must not choose the prompt.

**Proposal: capability `sensei`, host-owned prompts, single shot.**

```
scroll → host   { dojo:'scroll', v, type:'sensei', session, id, unitId, context }
host → scroll   { dojo:'scroll', v, type:'senseiReply', session, id, kind, text? }
```

- `context` is bounded data the course chooses to share: `{ text?: string, code?: { language, files? }, attempt?: number }`, at most 8 KiB in total. The host wraps it in **its own** system prompt; the course supplies none.
- `kind`: `ok` (with `text`, plain text, never HTML), `limit` (per-user rate limit), `unavailable` (LLM down or feature off), `denied`.
- Granted only if the manifest declares `sensei`, the instance has the LLM feature on, and the user is signed in (the same three conditions as `run`). Anonymous visitors never get it.
- Single shot, no thread, no streaming in the first version (PRD 026, option A); both can be added later without breaking it.
- The course must degrade when it is not granted, as with `run`: it shows nothing or its own static hint. That keeps standalone intact.
- `llm` stays reserved. A raw model is a different risk (cost, prompt injection, arbitrary use) and should wait for a real consumer.

**Domain Wall's pack generation** (structured JSON from a description) is not a sensei hint. Options: keep it standalone-only for now (its own ADR already allows it), or later a host-side allowlist of named tasks with host-owned schemas. I recommend the first; do not design the second until it is needed.

**Pattern Circuit does not need the sensei today.** It has its own notes and tiered hints. It would be the test case for the capability only if you want a "ask about my wrong choice" feature, which is a product decision, not a protocol one.

## 6. Viability

### 6.1 Does it meet the needs?

| Need | Pattern Circuit | Domain Wall | Dojo (host) |
|---|---|---|---|
| Handshake and origin safety | v0 as is | v0 as is | built, tested |
| Progress per unit | yes | yes (concepts as units) | built |
| Course-level state | G1 | G1 | small API change |
| Locale | yes, course also keeps its own switch | yes | `init`/`setLocale` built |
| Theme and mode | tokens + G3 | tokens + G3 | add two keys |
| Code language | G2 | G2 | read user setting |
| Run the shown code | `run` (languages and limits fit: files are small) | `run` + own parsing | built |
| Sensei | not now | optional | G4, design above |
| Works with no host | v0 §9; already true | already true | n/a |

### 6.2 Easy to support

Every protocol change touches the same places: the Zod schema, the committed JSON Schema (drift test), the shim, the host, a conformance rule with a broken fixture, and the docs. That is why additions need rules:

1. **Convention before field, field before message, message before capability.** G3 is a convention; G2 is one optional field; G1 is a relaxed field; only G4 is a capability.
2. **Two consumers.** Nothing is added for one course. All four gaps above have two.
3. **Additive only while `v: 0`**, then freeze: when Pattern Circuit and Domain Wall both pass conformance, tag `v: 1` with the additions folded in, and from then on changes are additive or a new `v`.
4. **Dojo owns the spec** (`PROTOCOL.md`, Zod, schemas, conformance). Courses own their adapters.
5. **Courses pin the schema.** Each course vendors the JSON Schemas at a Dojo commit and a test fails on drift, so a protocol change is a visible bump in the course, not a surprise.
6. **The shared adapter waits.** Once two courses both have a working adapter, extract it to a package in Dojo's monorepo, separate from `scroll-conformance`; its own test is passing conformance. Not before.

### 6.3 Solid

- Conformance already covers spoofing (origin, source, nonce, replay), standalone silence and manifest consistency. A course adapter that passes it nightly is solid against the contract, not only against its own tests.
- A host regression is a different failure from a course regression: conformance uses a reference host, so Dojo's real host needs its own contract test (a course fixture in `apps/e2e`, which exists).
- Risk: `v: 0` allows breaking changes. Mitigated by pinning (6.2.5) and by the freeze plan.

### 6.4 Effort

| Work | Size | Where |
|---|---|---|
| Pattern Circuit: replace the wire format and the manifest, delete the test host and the host controller (Dojo's reference host replaces them), keep ports, standalone adapter and tests | M | this repo |
| Pattern Circuit: unit, e2e (`@smoke` per PR, full nightly) and deployed smoke | M | this repo |
| Pattern Circuit: run the shown code through `run` | S–M | this repo, after the host supports the languages (Ruby, TypeScript, Python must exist in Dojo's Piston) |
| Dojo: G1, G2, G3 | S each | Dojo |
| Dojo: G4 (`sensei`) | M | Dojo, after a short ADR |
| Domain Wall: adopt v0 (envelope, `?host=`, nonce and session, theme, `run` parsing) | M | its own project and conversation |

## 7. Order of work

1. Decide (section 8). Then open an issue in Dojo with G1–G3 as one proposal, and G4 as a separate ADR draft.
2. Pattern Circuit adopts v0 now, without waiting for the gaps: G1 can be worked around with a reserved unit id for course state until Dojo supports it; G2 and G3 are optional and ignored when absent.
3. Run Dojo's conformance suite against Pattern Circuit's build. Whatever fails becomes a fix or a spec question.
4. Freeze `v: 1` when both courses pass.

## 8. Decisions needed

1. Adopt Dojo scroll v0 as the base and retire course-kit? (Recommended.)
2. Are G1–G3 right as proposed (G3 as a convention)?
3. Sensei: capability `sensei` with host-owned prompts, signed-in only, single shot? Or wait for Domain Wall's real need?
4. Is a Pattern Circuit "ask the sensei" feature wanted, or is the sensei only for other courses?
5. Where does the shared adapter eventually live: a package in Dojo's monorepo, published from there?

## 9. Not verified

- Dojo's host behavior beyond what I read (`scrollHost.ts`, `RecordScrollProgress.ts`); I did not run its conformance suite against Pattern Circuit.
- Whether Dojo's Piston has the runtimes and versions the displayed code needs (the verification pins Ruby 3.0.1 and Python 3.10 from Dojo's list).
- Domain Wall's real needs beyond its two documents; it is handled in another conversation.
- The size of the Dojo-side changes is estimated from the code I read, not measured.
