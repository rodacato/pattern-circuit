# Contributing to Pattern Circuit

Thanks for your interest! This document explains how to set up the environment, what a change is expected to include and how to add levels or patterns.

## Environment

- Node 22 or later.
- Ruby (optional): if it is installed, `npm test` runs `ruby -wc` on every Ruby file the player sees.

```bash
npm install
npm run dev      # http://localhost:5173 (add ?debug for the engine view)
npm run check    # types + lint + tests: must pass before every commit
npm run coverage # coverage with thresholds
```

## Workflow

1. Create a branch from `main`.
2. Make small, focused commits. Commit messages are written in English, in the format `type(scope): what changes`:
   - types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`;
   - usual scopes: `engine`, `game`, `render`, `ui`, `levels`, `content`.
3. `npm run check` must be green. If you change logic, add or adjust tests.
4. Note the change in the `[Unreleased]` section of [CHANGELOG.md](CHANGELOG.md).
5. Open a pull request; CI runs the same checks.

## Code rules

- **Everything that is code is English**: identifiers (including the ids in level data: nodes, sockets, tickets, tags, chapters), file and folder names, comments, test titles, commit messages and documentation. The only Spanish that remains is text the player reads (see "Texts" below).
- **Layers**: `engine ← levels`, `engine ← game ← render ← ui`. The rules are in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and `src/architecture.test.ts` enforces them. If that test fails, the fix is almost never to relax the rule.
- **Outside `engine/` only `engine/index.ts` is imported.**
- **Logic does not live in components or in the render**: if something has to be decided, it goes to `game/` (pure functions when possible) with its test.
- **The engine is deterministic**: no `Math.random()` and no real time inside `engine/`.
- Short comments that explain the *why*, not the *what*.
- Texts: write them in Spanish where they are shown, with `t()` / `msg()` / `N()`, and add their translation to the English catalog (`src/i18n/en/`); the coverage test tells you which ones are missing.
- Accessibility: everything new must be usable with the keyboard, and controls with an icon carry an `aria-label`.

## Adding a level

1. Create `src/levels/<id>/` (the folder name is the level id: lowercase English words separated by hyphens, **no ordinal**; the position comes from `order`) with:
   - `level.ts`: the data, using `defineLevel` and the helpers from `levels/kit.ts`;
   - the Ruby snippets (`.rb`), with `# region: Class#method` / `# endregion` regions for every `codeRef`;
   - their TypeScript equivalents in `ts/`, with the same keys, the same story line by line and `// region:` regions with the same names;
   - `level.test.ts`: the pedagogical behavior of each option ("Observer charges three times", "Strategy + ticket touches 0 nodes");
   - `en.ts`: the English translation of every text of the level (the `i18n` coverage test says which ones are missing).
   Everything inside the snippets (identifiers, comments, output strings) is English.
2. The registry discovers it by itself. `defineLevel` validates every reachable variant and `levels.test.ts` checks the common invariants (without a pattern it fails, with the right one it wins, no wrong one wins…).
3. Ids are permanent: they are stored in the players' saved progress. If one ever has to change, add the old id to `LEGACY_LEVEL_IDS` / `LEGACY_SOCKET_IDS` in `src/game/progress/progress.ts`.
4. If the level goes in a new chapter, add it in `levels/tracks.ts`, in order.
5. Update the progression table in [docs/DESIGN.md](docs/DESIGN.md).

## Adding a pattern

1. Add it to `PATTERN_IDS` (`engine/schema.ts`) and to `PATTERNS` (`engine/patterns.ts`), with its family and its idea in one sentence.
2. Give it a skin in `render/skins/` (the type requires one).
3. Teach it in some level (a test requires it).
4. Add its source to the "Sources" section of [docs/DESIGN.md](docs/DESIGN.md).

## Content: nothing made up

Pattern Circuit teaches, so the content has to be correct:

- Every idea, field note and verdict (`solves`, `partial`, `misfit`) must be backed by a verifiable source: a book, a paper or an article by the pattern's author. Cite the source in the PR.
- If the game simplifies, the simplification must not contradict the source. If it teaches a variant (for example Bloch's Builder), it is named in the documentation.
- Simple, short, concrete texts, in the cafeteria's world.

## Publishing a release

1. Move what is under `[Unreleased]` to a new `[X.Y.Z] - YYYY-MM-DD` section in [CHANGELOG.md](CHANGELOG.md), following [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
2. Bump the version in `package.json` following [Semantic Versioning](https://semver.org/). A change that invalidates saved progress or the level format is a major change.
3. Commit `chore(release): vX.Y.Z` and an annotated tag `vX.Y.Z`.
4. Push `main` and the tag: the deploy to GitHub Pages is automatic.
