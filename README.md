# Pattern Circuit

Juego educativo para entender **patrones de diseño viéndolos, no leyéndolos**. Una cafetería es un circuito de nodos; cada pedido es un pulso de luz que lo recorre. Cuando algo falla (pedidos perdidos, cobros dobles, código que hay que abrir para cada cambio), enchufas un patrón en el socket y ves cómo cambia el recorrido, junto al código que lo implementa, en **Ruby o TypeScript**.

- **27 niveles** en 9 capítulos, del tutorial a "la cafetería completa".
- **20 patrones**: 14 del catálogo GoF, Ports & Adapters, Event Bus, CQRS, Null Object, Circuit Breaker y Saga. Y un capítulo para lo contrario: cuándo **no** aplicar uno.
- Cada nivel sigue el mismo ritmo: **observar el problema → elegir un patrón → aplicar un cambio → comparar sin/con**.
- Probar el patrón equivocado también enseña: cada intento deja una nota en el **Cuaderno de patrones**.
- El contenido está verificado contra las fuentes originales (GoF, Fowler, Cockburn, Nygard…); la bibliografía está en [docs/DESIGN.md](docs/DESIGN.md#fuentes).

## Cómo se juega

| Acción | Mouse | Teclado |
|---|---|---|
| Reproducir / pausa | ▶ | `Espacio` |
| Paso adelante / atrás | ▶\| · ◀ | `→` · `←` |
| Reiniciar | ↺ | `R` |
| Ver el código de un nodo o seguir un pulso | clic sobre él | — |
| Enchufar un patrón | arrastrar el cartucho al socket ⬡ | `Tab` hasta el cartucho + `Enter` |
| Desenchufar | clic en el cartucho enchufado | `Enter` sobre él |
| Reparar un cable (nivel 0) | arrastrar desde el puerto de salida | botón "Conectar… sin arrastrar" |
| Cámara | rueda: zoom · arrastrar el fondo · doble clic: encuadrar | — |

Está en **español e inglés** (botón ES/EN arriba). El progreso se guarda en tu navegador (`localStorage`). Se borra desde el Cuaderno. El juego está pensado para pantallas de escritorio y respeta la preferencia de movimiento reducido del sistema.

| Capítulo | Niveles | Patrones |
|---|---|---|
| Apertura | 0 | tutorial |
| El mostrador | 1–4 | Strategy, Factory Method, Builder, Singleton |
| La barra crece | 5–9 | Adapter, Decorator, Composite, Facade, Proxy |
| Hora pico | 10–14 | Observer, State, Chain of Responsibility, Command, Template Method |
| Todo junto | 15–17 | combinaciones en circuitos con 2 y 3 sockets |
| Arquitectura | 18–20 | Ports & Adapters, Event Bus, CQRS |
| Resiliencia | 21–23 | Null Object, Circuit Breaker, Saga |
| Criterio: cuándo no | 24–25 | mantenerlo simple frente a patrones que sobran |
| La cafetería completa | 26 | todo funcionando junto |

## Desarrollo

Requiere Node 22 o superior. Ruby es opcional: si está instalado, los tests verifican la sintaxis de todo el código Ruby que ve el jugador (la del TypeScript se verifica siempre).

```bash
npm install
npm run dev
```

| Script | Qué hace |
|---|---|
| `npm run dev` | el juego en modo desarrollo (añade `?debug` a la URL para ver el motor en crudo) |
| `npm test` | tests: motor, niveles, aplicación, render, UI y reglas de arquitectura |
| `npm run coverage` | tests con cobertura y umbrales mínimos |
| `npm run check` | tipos + lint + tests (lo mismo que corre CI) |
| `npm run build` | build estático en `dist/` |

## Estructura

```
src/
  engine/   motor de simulación puro y determinista, esquema de niveles (sin DOM)
  levels/   un nivel = carpeta con level.ts (datos) + fragmentos .rb; se registran solos
  game/     aplicación: sesión, flujo del nivel, reproducción y progreso
  render/   render PixiJS neón y firma visual por patrón
  ui/       interfaz React
  debug/    vista del motor (?debug)
```

Las capas dependen en una sola dirección y un test lo verifica. Detalle en [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md); diseño del juego, progresión y fuentes en [docs/DESIGN.md](docs/DESIGN.md).

## Publicar en GitHub Pages

1. Sube el repo a GitHub (rama `main`).
2. En **Settings → Pages**, elige **Source: GitHub Actions**.
3. Cada push a `main` corre las verificaciones y publica el juego ([`deploy.yml`](.github/workflows/deploy.yml)). Los pull requests corren las mismas verificaciones ([`ci.yml`](.github/workflows/ci.yml)).

El build usa rutas relativas, así que funciona bajo cualquier subruta (`https://<usuario>.github.io/<repo>/`).

## Contribuir

Ver [CONTRIBUTING.md](CONTRIBUTING.md). Los cambios de cada versión están en [CHANGELOG.md](CHANGELOG.md).

## Licencia

[MIT](LICENSE.md) © Adrian Castillo
