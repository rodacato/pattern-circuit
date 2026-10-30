# Changelog

All notable changes to Pattern Circuit are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/). For a game, "public API" means: the level format (`LevelDef`), the engine API (`engine/index.ts`) and the player's saved progress; a change that breaks saved progress is a major change.

## [Unreleased]

### Changed

- **Everything that is code is English.** Level ids and folders no longer carry their position (`strategy`, `branches-and-payments`, `full-cafe`…); the ids of nodes, sockets, repairs, tickets, scenarios, wires, tags, ports and chapters, the snippet files and code keys, the test titles, the comments and the documentation are all English. Commits are in English from now on.
- The Ruby and TypeScript snippets shown in the code panel are fully English: comments, output strings and identifiers (for example `Charged: …`, `:oat`, `OatMilkLatte`). The texts the player reads in the game (briefs, notes, labels) are unchanged.
- **Texts are identified by keys and live in catalogs**: components, render, game and level data contain no prose. A new language is a folder of catalog files (`npm run i18n:scaffold`), with parity tests for every locale. English is the source of the typed keys. The Spanish locale is now `es-MX` (a saved `es` is recognized), and the language button cycles through the registered languages.
- "Erase progress" asks for confirmation inside the notebook instead of a native `confirm()` (which an embedding page can block). The flow's change ticket is one state (`open`, `applied`, `met`) instead of two booleans, and the engine's error messages are English.
- The English label of the language button is now "Change language" (it read "Cambiar idioma (switch to Spanish)").
- The game's page (`index.html`) is described in English and says 27 levels, Ruby and TypeScript.
- Saved progress from 1.0 and 1.1 keeps working: level ids and review-card socket ids are translated on load (`LEGACY_LEVEL_IDS`, `LEGACY_SOCKET_IDS`).
- Wires are legible at rest: the concrete wire color and the alpha of interface wires reach 3:1 against the stage, and code line numbers use the muted text color instead of the faint one.
- The README says who the course is for and how each canvas action is done by keyboard.
- Easier to read: code at 13.5 px with less dimming outside the active region, muted helper text no smaller than 11–12 px, and node titles and class names shrink to fit their node instead of spilling over it.

### Added

- **A host can theme the course**: the chrome (bars, panels, text, code panel and its colors) follows the colors, fonts and light or dark mode the host sends, with unreadable text ignored; the circuit stage keeps the neon identity (dark ground, pulse, family and status colors) in any theme.
- **The course can be embedded** in a hub (such as Dojo) through an iframe, with the same game on its own: a manifest (`course.json`), a typed, versioned `postMessage` protocol with strict origin checks, progress and preferences kept by the host when embedded, and a test host (`npm run host:test`). See `docs/ARCHITECTURE.md`.
- The code panel shows each region's name the way the language spells it (`Counter#hand_over` in Ruby, `Counter#handOver` in TypeScript); a test checks that both languages tell the story with the same regions.
- `npm run i18n:scaffold` to start a new language from the English catalogs.
- **The circuit can be explored without a pointer**: a "⌨ Keyboard" panel lists every node (with what it sends to) and the pulses in flight; `Enter` inspects a node or follows a pulse, exactly like clicking it on the canvas, and buttons zoom and reframe the camera.
- **A "how to play" guide**: four steps on the first visit (the circuit, the playback controls, the code panel, plugging and comparing), again from the **?** button; `?walkthrough=off` keeps it closed.
- **End-to-end tests on the production build** (Playwright): smoke tests on every pull request, and a nightly suite that solves all 27 levels from the UI in both languages and two viewports, with a reload halfway.
- **Python as a third code language** for all 27 levels, with the same regions and the same output as Ruby, a Python example of each pattern in "Where you've seen it" (standard library, Django, Celery… each checked against its docs) and Python in the language list a host receives.
- **The code players see is executed, not only parsed**: every file a variant can show runs against stubbed collaborators in Ruby, TypeScript and Python, and all must print the same. CI runs it on Ruby 3.0.1 and Python 3.10, the versions Dojo executes; two command snippets were adjusted to be valid there (`raise(…)` in an endless method).
- A test that every `Class#method:branch` region in the snippets names a branch that exists, so a renamed branch can no longer silently stop highlighting its code.

### Fixed

- **Every TypeScript snippet now runs**, so the README's promise holds: the 17 assemblies that declared a class twice are gone, and so is the list that excused them. In live-orders the notices live in their own `OrderUpdates` class instead of reopening `Order`, which was also wrong in Ruby (Observer's `initialize` replaced State's) and in Python (the second `class Order` replaced the first). In combos-with-extras each misfit shows one `CoffeeMenu` instead of two.
- The builder's `OrderTaker#take` builds the order from the request it receives, in the three languages; a test runs it with the two orders the level animates and checks that the hot iced drink is turned away before charging.
- **Four solutions worked only on paper**, because running a snippet builds its objects and never calls them. The Python Singleton let `TicketCounter()` make a second counter; Ruby and Python `LoyaltyCards` read `cards` without creating them; the Ruby Saga's `Barista` handed over to a counter it never had; and the TypeScript and Python extras decorators treated what `make` returns as one drink, when the Composite they join returns its parts, as Ruby already did. A test now calls each of those solutions the way its circuit does, in every language.
- Code comments are readable: Tokyo Night's comment color read at 2.7:1 on the code panel, and comments carry part of each lesson; it is now 5:1. The Strategy cartridge comment no longer says "nothing else" when the wiring gains its entry.
- Three texts claimed more than their code: the caramel decorator is one class *and* its entry in `EXTRAS`, not "nothing else"; calling a Celery task runs it in place, and `delay()`/`apply_async()` are what send the message; and CQRS says why its read view has no line (it is precomputed and can be copied) and that the second model is rarely worth it.
- Metrics say what they count: Observer, Event Bus and live-orders count notifications or events, not delivered orders, and `duplicatesAtSink` reads "duplicated orders" instead of "double charges".
- Misfit notes no longer present a limit of this implementation as something the pattern cannot do (Strategy "doesn't recurse", a single factory "doesn't know the branch", Facade "doesn't decouple", Command "undoes in memory", "nothing to decouple" with one listener).
- Closing messages claim only what happened: "You solved it with…" instead of "You learned…", "You completed the final walkthrough!", and a change ticket says no existing node changed its behavior, not that nothing changed. Counts read "Notes: 1" instead of "1 notes".

- Feedback says what the game checks: the guiding hints for lost and wrong orders send the player to follow a pulse instead of assuming a cause, the "partial" prediction reads "It helps in part, but not enough", a change ticket that opens only the node the level allows is no longer shown as a failure, the family hint for keep-simple says it is a principle and not a pattern, a repeated pulse reads "repeated!" instead of "charged again!", and the live-orders undo, the review schedule and the closing card are described as they are.
- At 1280×720 the level-complete card no longer hides its buttons under the legend when two patterns are summarized, the legend no longer overlaps the open inventory, and the code panel header no longer squeezes the region name.

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
