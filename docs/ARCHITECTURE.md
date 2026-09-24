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
| **ui** | `src/ui/` | React: layout, tarjetas, controles, panel de código. Monta el render. | engine, game, render, levels, `react`, `shiki` |
| **debug** | `src/debug/` | Vista del motor en crudo (`?debug`). | `engine`, `levels`, `react` |

Además, **fuera de `engine/` solo se importa `engine/index.ts`**: la API pública del motor (los tests también pueden usar `engine/testing.ts`). Lo interno puede reorganizarse sin tocar el resto. Los tests pueden además cargar niveles reales y usar `vitest`, `node:*` y Testing Library.

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
- **Una primitiva, un método**: `Tick.resolve` solo despacha; cada primitiva con estado (`transform`, `counter`, `cache`, `machine`, `breaker`, `join`, `buffer`) tiene su método en `sim.ts`.
- **Calificar sin re-simular**: `evaluate = simular + score`. La sesión ya tiene la corrida terminada, así que solo llama a `score` con sus métricas.
- **Primitivas cerradas**: un patrón nunca es código del motor, es un `GraphPatch` de primitivas. Añadir una primitiva es un cambio de motor, con su test; añadir un patrón o un nivel no.
- **Eventos como frontera**: el motor emite `SimEvent`; render y ui reaccionan a ellos sin conocer la simulación por dentro.

## levels: contenido

- Un nivel puede tener **varios sockets**: las variantes alcanzables son el producto cartesiano de lo que se puede enchufar en cada uno, y el código Ruby se compone con `base` + un fragmento por socket. Los niveles de combinación reutilizan los `.rb` de los niveles donde se aprendió cada patrón.
- `defineLevel` valida el esquema y **todas las variantes alcanzables** (cualquier subconjunto de reparaciones × patrones × tickets): si una no compila, no tiene escenario o apunta a una región de Ruby inexistente, el nivel no carga y el test falla.
- Un nivel tiene **como máximo un ticket de cambio**: el flujo tiene una sola etapa "cambio" y el esquema lo impone.
- El registro (`levels/index.ts`) descubre carpetas con `import.meta.glob`: añadir un nivel no toca ningún otro archivo.
- `levels/kit.ts` trae ayudantes (`node`, `wire`, `abstract`, `chain`, `pulse`…) para escribir niveles con poco ruido.
- Cada nivel tiene su `level.test.ts` con el comportamiento pedagógico de cada patrón ("Observer cobra tres veces", "Strategy + app toca 0 nodos").
- `levels.test.ts` verifica en **todos** los niveles, sin escribir nada extra: que sin patrón se falla, que el patrón correcto gana (también con su ticket), que ningún patrón incorrecto gana, que cada opción está en el inventario, que los capítulos avanzan en orden y que cada patrón del catálogo se enseña en algún nivel.

## game: aplicación

```
game/
  session/GameSession.ts   fachada que usan render y ui
  playback/Playback.ts     línea de tiempo, velocidad, interpolación, foco del panel de código
  flow/levelFlow.ts        máquina de estados del nivel (reducer puro)
  progress/                puerto ProgressStore + adaptadores (localStorage, memoria)
  events/Emitter.ts        suscripción mínima para React
```

- **GameSession** coordina; no dibuja ni conoce React. Expone comandos (`play`, `plug`, `unplug`, `connect`, `applyTicket`, `resetProgress`…) y estado de solo lectura (`pendingSockets`, `comparisonRows`, `pluggedAt`, `outcomeOf`…). Las decisiones viven en funciones puras de `levelFlow` y `progress`; la sesión solo las llama.
- **Flujo del nivel** como reducer puro `(nivel, estado, evento) → estado`:
  `observar → elegir → cambio → comparar → completado`. Las etapas se saltan solas según los datos del nivel (sin sockets no hay "elegir"; sin tickets no hay "cambio"). Junto al reducer viven sus selectores puros: `stagesFor`, `targetSocket` (a qué socket va un patrón), `pluggedPatterns`, `pendingSockets`, `lastPluggedOption`.
- **Progreso** detrás de un puerto (`ProgressStore`): la sesión recibe el adaptador por constructor. Tests usan el de memoria; la app, el de `localStorage` con esquema versionado y validado.

## render: presentación (humble object)

```
render/
  NeonStage.ts    bucle por frame, nodos, cámara, gestos → comandos de la sesión
  PulseLayer.ts   pulsos: posición interpolada, estelas, turnos, pulso seguido
  SocketLayer.ts  sockets hexagonales y el efecto de enchufar
  layout.ts       geometría de pantalla pura (fit, zoom, hit test, interpolación) — con tests
  motion.ts       animaciones de nodo sin Pixi (destello, sacudida, aparición) — con tests
  draw.ts         ayudantes de dibujo (formas, hexágono, línea discontinua, textos)
  skins/          firma visual por patrón, agrupadas por familia/capítulo
  fx.ts           partículas, ondas y textos flotantes
  theme.ts        paleta y tipografías
```

- Lo que se puede calcular sin Pixi vive en funciones puras con test (`layout.ts`: encuadre, zoom alrededor del puntero, hit tests, interpolación). `NeonStage` queda como pegamento delgado.
- **Skins**: cada patrón aporta su firma (cartuchos, ondas, anillos, moldes…) implementando la interfaz `Skin`. `createSkins()` devuelve un `Record<PatternId, Skin>` completo: un patrón sin skin no compila.
- **Movimiento reducido**: con `prefers-reduced-motion` no hay partículas, sacudidas, rebotes ni cables que fluyen; los textos informativos se quedan quietos.

## ui: composición

- Componentes pequeños que leen la sesión con `useSession(session, selector)`, que solo re-renderiza cuando cambia lo seleccionado.
- La lógica no vive en componentes: si un componente necesita decidir algo, esa decisión va a `game/`.
- **Accesibilidad como regla**: todo se puede jugar con teclado (cartuchos con Enter/Espacio, cable con el botón "Conectar… sin arrastrar", atajos en `shortcuts.ts`), las tarjetas son `role="status"`, el cuaderno es un diálogo con Escape y foco, y los controles con ícono tienen `aria-label`.
- Si `localStorage` no está disponible, el progreso vive en memoria durante la sesión.

## Tests

| Qué | Dónde | Estilo |
|---|---|---|
| Motor | `engine/**/*.test.ts` | unitarios sobre circuitos mínimos (`engine/testing.ts`) |
| Niveles | `levels/*/level.test.ts` + `levels/levels.test.ts` | comportamiento por patrón + invariantes comunes a todos los niveles |
| Aplicación | `game/**/*.test.ts` | sesión, flujo y progreso con adaptador en memoria |
| Código Ruby | `levels/ruby.test.ts` | `ruby -wc` sobre cada archivo que ve el jugador (se omite sin ruby) |
| Render | `render/layout.test.ts`, `render/motion.test.ts` | geometría y animaciones puras |
| UI | `ui/ui.test.tsx` | componentes con Testing Library (jsdom) sobre una sesión real |
| Arquitectura | `architecture.test.ts` | reglas de dependencia entre capas |

`npm run check` corre tipos, lint y tests. `npm run coverage` mide cobertura con umbrales (85 % líneas, 75 % ramas). Se excluyen a propósito el contenido de los niveles (lo cubren sus tests de comportamiento), el dibujo con Pixi (humble object: lo calculable está en `layout.ts` y `motion.ts`, que sí se miden) y los puntos de entrada.

## Deuda técnica aceptada

Cosas que se dejan así a sabiendas, con su razón:

- **El dibujo Pixi no tiene tests unitarios.** Se verifica jugando y con la vista `?debug`; lo que tiene lógica se sacó a módulos puros.
- **`GameApp.tsx` no tiene test de componente**: monta Pixi. Sus piezas (atajos, tarjetas, inventario, cuaderno) sí lo tienen.
- **El bundle principal pesa ~850 kB** (PixiJS + React + niveles). La gramática de Ruby se carga aparte, bajo demanda.
- **El interruptor del motor cuenta fallos acumulados**: en el modelo los éxitos no vuelven a pasar por él, así que no puede reiniciar la cuenta. Alcanza para el nivel 22, donde todos los fallos son seguidos.
- **L01 arma sus nodos a mano** en vez de usar `kit.ts`: fue el primer nivel y sirve como ejemplo de la forma larga.

## Cómo extender

- **Nivel nuevo**: carpeta `src/levels/LNN-nombre/` con `level.ts`, sus `.rb` y un `level.test.ts`. Las invariantes comunes se comprueban solas.
- **Patrón nuevo**: añadirlo a `PATTERN_IDS` en `schema.ts` y a `PATTERNS` en `patterns.ts` (con su fuente en `docs/DESIGN.md`), su skin en `render/skins/`, y enseñarlo en algún nivel (los tests lo exigen).
- **Primitiva nueva**: variante en `Behavior` (`schema.ts`), caso en `sim.ts`, test en `sim/sim.test.ts`. Primitivas actuales: `source`, `sink`, `pass`, `transform`, `branch`, `slot`, `broadcast`, `guard`, `counter`, `join`, `cache`, `machine`, `buffer`, `breaker`.

## Deploy

`vite.config.ts` usa `base: './'`, así que el build es estático y funciona bajo cualquier subruta (`https://<usuario>.github.io/<repo>/`). El workflow [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) corre `npm run check` y publica `dist/` en GitHub Pages en cada push a `main`. El progreso del jugador vive en `localStorage` del navegador.
