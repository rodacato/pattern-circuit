# Pattern Circuit

An educational game for understanding **design patterns by seeing them, not reading them**. A cafeteria is a circuit of nodes; every order is a pulse of light that travels through it. When something goes wrong (lost orders, double charges, code that has to be opened for every change), you plug a pattern into the socket and watch the route change, next to the code that implements it, in **Ruby, TypeScript or Python**.

- **27 levels** in 9 chapters, from the tutorial to "the whole cafeteria".
- **20 patterns**: 14 from the GoF catalog, Ports & Adapters, Event Bus, CQRS, Null Object, Circuit Breaker and Saga. Plus a chapter about the opposite: when **not** to apply one.
- Every level follows the same rhythm: **observe the problem → pick a pattern → apply a change → compare without/with**.
- Trying the wrong pattern teaches too: every attempt leaves a note in the **pattern notebook**.
- The content is verified against the original sources (GoF, Fowler, Cockburn, Nygard…); the bibliography is in [docs/DESIGN.md](docs/DESIGN.md#sources).

## How to play

| Action | Mouse | Keyboard |
|---|---|---|
| Play / pause | ▶ | `Space` |
| Step forward / back | ▶\| · ◀ | `→` · `←` |
| Restart | ↺ | `R` |
| See a node's code or follow a pulse | click it | — |
| Plug in a pattern | drag the cartridge to the ⬡ socket | `Tab` to the cartridge + `Enter` |
| Unplug | click the plugged cartridge | `Enter` on it |
| Repair a wire (level 0) | drag from the output port | "Connect… without dragging" button |
| Camera | wheel: zoom · drag the background · double click: fit | — |

The game is available in **Spanish and English** (ES/EN button at the top); adding a language means adding catalog files, with no code change (see [CONTRIBUTING.md](CONTRIBUTING.md#adding-a-language)). Progress is saved in your browser (`localStorage`) and can be erased from the notebook. It is designed for desktop and tablet screens and respects the system's reduced-motion preference.

| Chapter | Levels | Patterns |
|---|---|---|
| Opening | 0 | tutorial |
| The counter | 1–4 | Strategy, Factory Method, Builder, Singleton |
| The bar grows | 5–9 | Adapter, Decorator, Composite, Facade, Proxy |
| Rush hour | 10–14 | Observer, State, Chain of Responsibility, Command, Template Method |
| All together | 15–17 | combinations in circuits with 2 and 3 sockets |
| Architecture | 18–20 | Ports & Adapters, Event Bus, CQRS |
| Resilience | 21–23 | Null Object, Circuit Breaker, Saga |
| Judgment: when not to | 24–25 | keeping it simple against patterns that are not needed |
| The whole cafeteria | 26 | everything working together |

## Development

Requires Node 22 or later. Ruby and Python are optional: if they are installed, the tests verify and run all the Ruby and Python code the player sees (the TypeScript is always verified).

```bash
npm install
npm run dev
```

| Script | What it does |
|---|---|
| `npm run dev` | the game in development mode (add `?debug` to the URL to see the raw engine) |
| `npm test` | tests: engine, levels, application, render, UI and architecture rules |
| `npm run coverage` | tests with coverage and minimum thresholds |
| `npm run check` | types + lint + tests (the same as CI runs) |
| `npm run build` | static build in `dist/` |

## Structure

```
src/
  engine/   pure, deterministic simulation engine and level schema (no DOM)
  levels/   one level = a folder with level.ts (data) + code snippets; they register themselves
  game/     application: session, level flow, playback and progress
  render/   neon PixiJS render and the visual signature of each pattern
  ui/       React interface
  debug/    engine view (?debug)
```

Layers depend in one direction only, and a test verifies it. Details in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md); game design, progression and sources in [docs/DESIGN.md](docs/DESIGN.md).

## Publishing to GitHub Pages

1. Push the repo to GitHub (branch `main`).
2. In **Settings → Pages**, choose **Source: GitHub Actions**.
3. Every push to `main` runs the checks and publishes the game ([`deploy.yml`](.github/workflows/deploy.yml)). Pull requests run the same checks ([`ci.yml`](.github/workflows/ci.yml)).

The build uses relative paths, so it works under any subpath (`https://<user>.github.io/<repo>/`).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). The changes of each version are in [CHANGELOG.md](CHANGELOG.md).

## License

[MIT](LICENSE.md) © Adrian Castillo
