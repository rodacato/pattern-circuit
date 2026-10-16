# Changelog

All notable changes to Pattern Circuit are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/). For a game, "public API" means: the level format (`LevelDef`), the engine API (`engine/index.ts`) and the player's saved progress; a change that breaks saved progress is a major change.

## [Unreleased]

### Changed

- **Everything that is code is English.** Level ids and folders no longer carry their position (`strategy`, `branches-and-payments`, `full-cafe`…); the ids of nodes, sockets, repairs, tickets, scenarios, wires, tags, ports and chapters, the snippet files and code keys, the test titles, the comments and the documentation are all English. Commits are in English from now on.
- The Ruby and TypeScript snippets shown in the code panel are fully English: comments, output strings and identifiers (for example `Charged: …`, `:oat`, `OatMilkLatte`). The texts the player reads in the game (briefs, notes, labels) are unchanged.
- **Texts are identified by keys and live in catalogs**: components, render, game and level data contain no prose. A new language is a folder of catalog files (`npm run i18n:scaffold`), with parity tests for every locale. English is the source of the typed keys. The Spanish locale is now `es-MX` (a saved `es` is recognized), and the language button cycles through the registered languages.
- The English label of the language button is now "Change language" (it read "Cambiar idioma (switch to Spanish)").
- The game's page (`index.html`) is described in English and says 27 levels, Ruby and TypeScript.
- Saved progress from 1.0 and 1.1 keeps working: level ids and review-card socket ids are translated on load (`LEGACY_LEVEL_IDS`, `LEGACY_SOCKET_IDS`).

### Added

- `npm run i18n:scaffold` to start a new language from the English catalogs.
- A test that every `Class#method:branch` region in the snippets names a branch that exists, so a renamed branch can no longer silently stop highlighting its code.

## [1.1.0] - 2026-09-24

Learning improvements: predict, see the change in the code, review, know when not to use a pattern and recognize it in real code. Also English, TypeScript and tablets.

### Added

- **Predict before seeing**: when a pattern is plugged in, the game asks what it will do (solves, partially, does not fit), and before a ticket, how many pieces will have to be modified. After running, it shows whether you were right; the notebook keeps count of correct predictions.
- **Changes in the code**: in the comparison, the panel's "Changes" tab shows which Ruby lines were added or removed (with a ticket: what the ticket forced to touch, without and with a pattern).
- **Spaced review**: the "Review" button poses problems from levels already completed, without a circuit, to choose the pattern. Every answer is explained with its field note; correct answers return at growing intervals (1, 3, 7, 14 and 30 days) and mistakes in the next round.
- **"Judgment: when not to" chapter** (levels 24 and 25): problems where fixing just what is needed wins, without adding a pattern nothing asks for yet (YAGNI). New metric: pieces in the circuit.
- **Where you've seen it**: each pattern shows a real example in Ruby or Rails (Rack middleware, SimpleDelegator, `Post.none`, ActiveJob…) with a link to its documentation, in the notebook and when the level is passed.
- **Tiered hints**: instead of the answer, first a guiding question according to the symptom, then the pattern's family (with GoF's definitions), then an elimination and, at the end, the pattern.
- **Touch and tablet**: pinch to zoom, double tap to fit, larger finger targets and a vertical layout (circuit on top, code below) up to 1000 px. On phones (under 600 px) the notice remains.
- **English version**: ES/EN button in the top bar; the whole interface, the 27 levels, the hints, the notes and the examples translated. The language is remembered in the browser. Code comments are still in Spanish.
- **TypeScript code**: the code panel switches between Ruby and TypeScript; the 27 levels tell the same story in both languages. The choice is remembered in the browser.

### Changed

- Chapters belong to a **track** (`levels/tracks.ts`): preparation for adding new paths (for example, complete systems with CQRS, events or microservices) without touching the engine.
- The whole cafeteria becomes level 26. Progress saved with the previous id is translated automatically.

### Fixed

- On narrow desktops (1024 px), the level card no longer covers the stage card, and the legend no longer covers the inventory.
- The code panel's title is no longer separated by a huge gap when the tabs appear.

## [1.0.0] - 2026-09-24

First public release.

### Added

- **25 levels** (0–24) in eight chapters of a growing cafeteria: Opening, The counter, The bar grows, Rush hour, All together, Architecture, Resilience and The whole cafeteria.
- **20 patterns**: Factory Method, Builder, Singleton, Adapter, Decorator, Composite, Facade, Proxy, Strategy, Observer, State, Command, Chain of Responsibility, Template Method, Ports & Adapters, Event Bus, CQRS, Null Object, Circuit Breaker and Saga.
- Rhythm of every level: observe the problem → pick a pattern → apply a change ticket → compare without/with the pattern.
- Combination levels with several sockets (Factory Method + Strategy, Composite + Decorator, State + Observer + Command).
- Field notes for every pattern tried, also the ones that do not fit, gathered in the **pattern notebook**.
- Content verified against the original sources, with the bibliography in `docs/DESIGN.md`.
- Ruby code panel with highlighting that follows the pulse or the selected node.
- Neon render with PixiJS: visual signature per pattern, trails, particles, camera with zoom and pan.
- Playback controls: play/pause, step forward and back, speeds and keyboard shortcuts.
- Fully playable with the keyboard: cartridges with Enter/Space and wire repair without dragging.
- Accessibility: accessible names, announced cards (`role="status"`), the notebook as a dialog, visible focus and `prefers-reduced-motion` support.
- Progress saved in `localStorage` with a versioned schema, and an option to erase it.
- Deterministic simulation engine with 14 primitives, circuit patches and a modified-nodes metric.
- Exhaustive validation of every level: all reachable variants compile and have a scenario and code.
- Engine debug view (`?debug`).
- Static deploy to GitHub Pages and CI for pull requests with GitHub Actions.


[Unreleased]: https://github.com/rodacato/pattern-circuit/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/rodacato/pattern-circuit/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/rodacato/pattern-circuit/releases/tag/v1.0.0
