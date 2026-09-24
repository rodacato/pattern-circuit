# Pattern Circuit: diseño

Juego educativo para entender patrones de diseño viéndolos, no leyéndolos. Una cafetería simulada es un circuito de nodos; un pulso (el dato) lo recorre; en los sockets el jugador enchufa un patrón y el pulso reacciona.

## Decisiones tomadas

| Tema | Decisión |
|---|---|
| Lenguaje del código mostrado | **Ruby** (el formato `code: { rb }` admite otros después) |
| Idioma | UI en español; identificadores del código en inglés, comentarios en español |
| Plataforma | Escritorio por ahora |
| Stack | React + TypeScript + Vite, **PixiJS** (render tipo juego), zod para validar niveles, vitest |
| Progresión | Por capítulos de crecimiento de la cafetería (ver abajo) |
| Tema visual | **Circuito neón** (elegido tras comparar prototipos neón vs pixel art): fondo oscuro, nodos con brillo, cables de luz animados, pulsos con estela y partículas |

## Lenguaje visual

- **Pulso** = dato. Forma = tipo (● pedido, ■ pago, ▲ evento, ◆ comando). Color = estado (blanco ok, ámbar raro, rojo error).
- **Nodo** = objeto/componente. Se abre con zoom para ver sus ramas internas.
- **Cable** = dependencia. **Continuo = concreta; discontinuo = abstracta.**
- **Socket** = punto de variación (puerto hexagonal que late cuando hay un problema).
- **Cartucho** = patrón, con franja por familia: ámbar creacional, cian estructural, violeta comportamiento, verde arquitectura.
- **Síntomas fijos**: ramas que crecen, nodo caliente con cola, chispas en conexiones que no encajan, cables rojos + contador "Nodos modificados".
- **Ticket de cambio**: llega un requisito nuevo; se compara cuántos nodos existentes hay que abrir sin patrón y con él (el motor lo calcula por diff).
- **Resultados**: `solves` / `partial` / `misfit`. Probar un patrón incorrecto da una nota de campo para el *Cuaderno de patrones*.

### Firmas por patrón

| Patrón | Firma |
|---|---|
| Factory Method | Prensa con molde que estampa un nodo producto; cada subclase trae su molde |
| Builder | Cinta con estaciones; el pulso junta fichas; `build()` sella y valida |
| Singleton | Nodo con halo de candado; un segundo intento se funde con el original; cables globales tenues como coste |
| Adapter | Conector que cambia la forma del pulso (■ → ●) |
| Decorator | Anillos concéntricos que envuelven el pulso, apilables |
| Proxy | Gemelo translúcido delante de un nodo real dormido; los aciertos de caché rebotan |
| Composite | Árbol donde hojas y ramas comparten contorno; el resultado sube sumándose |
| Facade | Panel liso sobre un enredo; "ver detrás" lo levanta |
| Strategy | Cartuchos intercambiables en una ranura que cambian la ruta interna |
| Observer | Onda que se expande hacia un anillo de suscriptores enchufables |
| State | El nodo cambia de color y de cableado; minimapa de estados |
| Command | El pulso se vuelve tarjeta, se encola; deshacer la voltea y el pulso retrocede |
| Chain of Resp. | Fila de manos que escanean y pasan o absorben |
| Template Method | Vía fija con estaciones grises y ranuras de color (hooks) |
| Ports & Adapters | Núcleo hexagonal, adaptadores intercambiables afuera |
| Event bus | Línea circular por la que viajan eventos; nadie se cablea directo |
| CQRS | El circuito se parte en vía de escritura y vía de lectura con sincronización |

## Arquitectura

Detalle de capas, reglas de dependencia y cómo extender en [ARCHITECTURE.md](ARCHITECTURE.md).

```
levels/*/level.ts (datos + .rb) ─► defineLevel (zod + validación de variantes)
                                      │
                                      ▼
engine/ (TS puro, sin DOM): compile · step · Timeline · applyPatch · nodesTouched · evaluate
                                      │ snapshots + SimEvent[]
                                      ▼
session ─► render PixiJS neón + skins · panel de código · HUD · progreso (localStorage)
```

- `step(sim) → { sim, events }` es puro y determinista (tick fijo). Velocidad = ticks por frame.
- `Timeline` guarda referencias a snapshots cada N ticks; retroceder = restaurar + re-simular.
- **Primitivas cerradas** (`source`, `sink`, `pass`, `transform`, `branch`, `slot`, `broadcast`, `guard`; vendrán `accumulate`, `spawn`, `store`). Un patrón es un `GraphPatch` de primitivas + un skin. Nivel nuevo = solo datos.
- `nodesTouched`: un nodo existente cuenta si cambia su definición, desaparece o gana/pierde una dependencia **concreta** de salida. Registrar un cable abstracto en un `slot` no cuenta.
- Código Ruby con marcadores `# region: Clase#metodo` anidables; `Clase#metodo:rama` cae a la región padre.
- `defineLevel` recorre todas las variantes alcanzables (reparaciones × sockets × tickets) y falla si alguna no compila, no tiene escenario o apunta a una región de código inexistente.

El esquema completo está en [`src/engine/schema.ts`](../src/engine/schema.ts).

## Progresión

| # | Capítulo | Patrón | Contexto |
|---|---|---|---|
| 0 | Apertura | — | Circuito lineal (tutorial) |
| 1 | El mostrador | Strategy | Métodos de pago |
| 2 | | Factory Method | Sucursales con menús distintos |
| 3 | | Builder | Pedido a la medida |
| 4 | | Singleton | Contador de tickets (y su coste oculto) |
| 5 | La barra crece | Adapter | Terminal de pago de otro proveedor |
| 6 | | Decorator | Extras que suman precio |
| 7 | | Composite | Combos que contienen productos y combos |
| 8 | | Facade | La cocina |
| 9 | | Proxy | Inventario remoto y lento |
| 10 | Hora pico | Observer | "Pedido listo" → cliente, pantalla, lealtad |
| 11 | | State | Ciclo de vida del pedido |
| 12 | | Chain of Resp. | Descuentos y validaciones |
| 13 | | Command + undo | Cola del barista, cancelar/modificar |
| 14 | | Template Method | Recetas de preparación |
| 15–17 | Todo junto | Factory+Strategy · Composite+Decorator · State+Observer+Command | |
| 18 | Arquitectura | Ports & Adapters | Núcleo sin BD/Stripe/UI (paga el Singleton del 4) |
| 19 | | Event bus | Sucursales desacopladas |
| 20 | | CQRS | Pantalla de pedidos vs toma de pedidos |
| 21 | Final | — | Recorrido por la cafetería completa |

### Niveles 0–3 (resumen)

- **0 · Abre la cafetería**: `Cliente → Tomar → Cobrar → Preparar → Entregar`, falta el cable a Entregar. Enseña controles, clic en nodo → código, cable = dependencia. *(implementado)*
- **1 · ¿Efectivo o tarjeta?** (Strategy): `Cobrar` es un árbol if; el vale se pierde. Ticket "pago con app" abre `Cobrar`. Strategy: cartuchos, ticket con 0 nodos tocados. Observer cobra 3 veces; Decorator envuelve pero el vale se pierde igual. *(implementado)*
- **2 · Dos sucursales, dos menús** (Factory Method): el flujo compartido decide con `if` qué bebida crear y Montaña recibe lattes. Factory Method: una subclase (molde) por sucursal; abrir Puerto no toca nada existente. Singleton y Builder no encajan. *(implementado)*
- **3 · Pedido a la medida** (Builder): constructor de 9 argumentos, orden cruzado, combinación imposible que explota en cocina ya cobrada. Builder: estaciones con nombre + `build()` que rechaza antes de cobrar. Factory Method pierde los pedidos sin molde; Decorator = parcial. *(implementado)*

## Plan por fases

1. **Motor** ✅: primitivas, `step` determinista, Timeline, zod, GraphPatch, `nodesTouched`, niveles 0–1 como datos, tests, vista de depuración.
2. **Lenguaje visual** ✅: render PixiJS neón (brillo, estelas, partículas, cables animados), controles con teclado, panel de código Ruby con Shiki que sigue al pulso o al nodo, cable arrastrable para reparar, lista de pasos por nivel, tarjetas de resultado. Nivel 0 jugable de punta a punta.
3. **Sockets y patrones** ✅: inventario arrastrable, socket que late, skins por patrón, notas de campo y cuaderno, ticket de cambio, comparación sin/con, flujo del nivel como máquina de estados, progreso en localStorage. Niveles 1–3 jugables.
4. **Capítulos 1–3**: niveles 4–14 con sus skins. Ninguno toca `engine/`.
5. **Combinaciones y arquitectura**: niveles 15–21, cámara para circuitos grandes.
6. **Sandbox y pulido**: plantillas genéricas por patrón, transiciones, reduced-motion, teclado.
