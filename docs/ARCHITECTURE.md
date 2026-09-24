# Arquitectura

Pattern Circuit se organiza en **capas con dependencias en una sola dirección**. Cada capa tiene una responsabilidad y una regla de qué puede importar; [`src/architecture.test.ts`](../src/architecture.test.ts) lo verifica en cada `npm test`.

```
                ┌────────────┐
                │   levels   │  contenido: datos + Ruby
                └─────┬──────┘
                      │
┌──────────┐    ┌─────▼──────┐    ┌───────────┐    ┌──────────┐
│  engine  │◄───┤    game    │◄───┤  render   │◄───┤    ui    │
│ dominio  │    │ aplicación │    │ PixiJS    │    │ React    │
└──────────┘    └────────────┘    └───────────┘    └──────────┘
   puro            sin DOM          humble object     composición
```

| Capa | Carpeta | Responsabilidad | Puede importar |
|---|---|---|---|
| **engine** | `src/engine/` | Dominio puro: formato de niveles, simulación determinista, parches de circuito, evaluación. Sin DOM, sin React, sin Pixi. | solo `zod` |
| **levels** | `src/levels/` | Contenido. Un nivel = carpeta con `level.ts` + fragmentos `.rb`. | `engine` |
| **game** | `src/game/` | Aplicación: la partida (reproducción, foco, decisiones del jugador), el flujo del nivel y el progreso. Sin DOM ni Pixi. | `engine`, `zod` |
| **render** | `src/render/` | Dibuja el circuito con PixiJS y traduce gestos a llamadas a la sesión. | `engine`, `game`, `pixi.js` |
| **ui** | `src/ui/` | React: layout, tarjetas, controles, panel de código. Monta el render. | todas las anteriores, `react`, `shiki` |
| **debug** | `src/debug/` | Vista del motor en crudo (`?debug`). | `engine`, `levels`, `react` |

Además, **fuera de `engine/` solo se importa `engine/index.ts`**: la API pública del motor (los tests también pueden usar `engine/testing.ts`). Lo interno puede reorganizarse sin tocar el resto.

## engine: dominio

```
engine/
  schema.ts         contrato de datos (zod): niveles, primitivas, parches, métricas
  patterns.ts       catálogo de patrones: nombre, familia y la idea en una frase
  sim/              types · predicate · sim (step puro) · timeline
  circuit/          geometry · compile · patch (applyPatch, nodesTouched)
  level/            variants (buildCircuit, evaluate) · define (validación exhaustiva)
  code/             regions (marcadores # region en Ruby)
  testing.ts        constructores de circuitos para tests
```

- **Determinismo**: `step(sim) → { sim, events }` es puro. Todo lo que dependa del tiempo real vive fuera.
- **Primitivas cerradas**: un patrón nunca es código del motor, es un `GraphPatch` de primitivas. Añadir una primitiva es un cambio de motor, con su test; añadir un patrón o un nivel no.
- **Eventos como frontera**: el motor emite `SimEvent`; render y ui reaccionan a ellos sin conocer la simulación por dentro.

## levels: contenido

- `defineLevel` valida el esquema y **todas las variantes alcanzables** (reparaciones × patrones × tickets): si una no compila, no tiene escenario o apunta a una región de Ruby inexistente, el nivel no carga y el test falla.
- El registro (`levels/index.ts`) descubre carpetas con `import.meta.glob`: añadir un nivel no toca ningún otro archivo.
- Cada nivel tiene tests de comportamiento pedagógico en `levels.test.ts` ("Observer cobra tres veces", "Strategy + app toca 0 nodos").

## game: aplicación

```
game/
  session/GameSession.ts   fachada que usan render y ui
  playback/Playback.ts     línea de tiempo, velocidad, interpolación, foco del panel de código
  flow/levelFlow.ts        máquina de estados del nivel (reducer puro)
  progress/                puerto ProgressStore + adaptadores (localStorage, memoria)
  events/Emitter.ts        suscripción mínima para React
```

- **GameSession** coordina; no dibuja ni conoce React. Expone comandos (`play`, `plug`, `connect`, `applyTicket`…) y estado de solo lectura.
- **Flujo del nivel** como reducer puro `(nivel, estado, evento) → estado`:
  `observar → elegir → cambio → comparar → completado`. Las etapas se saltan solas según los datos del nivel (sin sockets no hay "elegir"; sin tickets no hay "cambio").
- **Progreso** detrás de un puerto (`ProgressStore`): la sesión recibe el adaptador por constructor. Tests usan el de memoria; la app, el de `localStorage` con esquema versionado y validado.

## render: presentación (humble object)

```
render/
  NeonStage.ts    capas Pixi, bucle por frame, gestos → comandos de la sesión
  layout.ts       geometría de pantalla pura (fit, hit test, interpolación) — con tests
  skins/          firma visual por patrón: registro PatternId → Skin
  fx.ts           partículas y textos flotantes
  theme.ts        paleta y tipografías
```

- Lo que se puede calcular sin Pixi vive en funciones puras con test (`layout.ts`). `NeonStage` queda como pegamento delgado.
- **Skins**: cada patrón aporta su firma (cartuchos, ondas, anillos, moldes…) implementando la interfaz `Skin`. Un patrón nuevo = un archivo en `skins/` + registrarlo.

## ui: composición

- Componentes pequeños que leen la sesión con `useSession(session, selector)`, que solo re-renderiza cuando cambia lo seleccionado.
- La lógica no vive en componentes: si un componente necesita decidir algo, esa decisión va a `game/`.

## Tests

| Qué | Dónde | Estilo |
|---|---|---|
| Motor | `engine/**/*.test.ts` | unitarios sobre circuitos mínimos (`engine/testing.ts`) |
| Niveles | `levels/levels.test.ts` | comportamiento pedagógico por variante |
| Aplicación | `game/**/*.test.ts` | sesión, flujo y progreso con adaptador en memoria |
| Render | `render/layout.test.ts` | geometría pura |
| Arquitectura | `architecture.test.ts` | reglas de dependencia entre capas |

`npm run check` corre tipos, lint y tests.

## Cómo extender

- **Nivel nuevo**: carpeta `src/levels/LNN-nombre/` con `level.ts` + `.rb`; añadir sus expectativas a `levels.test.ts`.
- **Patrón nuevo**: añadirlo a `PATTERN_IDS` en `schema.ts` (si no existe), su skin en `render/skins/`, y usarlo en un socket de un nivel.
- **Primitiva nueva**: variante en `Behavior` (`schema.ts`), caso en `sim.ts`, test en `sim/sim.test.ts`.
